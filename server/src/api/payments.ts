import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../utils/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { checkoutSchema } from '../validation/paymentSchemas';
import { createCheckoutSession, verifyWebhookSignature, isTestMode } from '../lib/stripe';
import { notifyMakerOrderPlaced, notifyOrderStatusChange } from '../lib/notifications';
import { calculateRevenue } from '../config/commerceConfig';

const router = Router();

// Create checkout session
router.post(
  '/checkout',
  authenticateToken,
  validate(checkoutSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { productId, quantity, currency = 'USD' } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      // Fetch product
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          maker: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
          code: 'PRODUCT_NOT_FOUND',
        });
      }

      if (product.status !== 'PUBLISHED') {
        return res.status(400).json({
          success: false,
          message: 'Product is not available for purchase',
          code: 'PRODUCT_NOT_AVAILABLE',
        });
      }

      // Check stock if available
      if (product.stock !== null && product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock',
          code: 'INSUFFICIENT_STOCK',
        });
      }

      // Calculate total price
      const totalPrice = product.price * quantity;

      // Calculate revenue split
      const { platformFee, makerRevenue } = calculateRevenue(totalPrice, currency);

      // Create order in database
      const order = await prisma.order.create({
        data: {
          buyerId: userId,
          productId: productId,
          quantity: quantity,
          totalPrice: totalPrice,
          currency: currency,
          status: 'PENDING',
          paymentProvider: 'STRIPE',
          platformFee,
          makerRevenue,
        },
      });

      // Create Stripe checkout session
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const locale = req.headers['accept-language']?.includes('ar') ? 'ar' : 'en';

      const session = await createCheckoutSession({
        orderId: order.id,
        productName: product.name,
        amount: totalPrice,
        currency: currency,
        quantity: quantity,
        successUrl: `${frontendUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${frontendUrl}/${locale}/checkout/cancel?order_id=${order.id}`,
        customerEmail: req.user?.email,
      });

      // Update order with checkout session ID
      await prisma.order.update({
        where: { id: order.id },
        data: {
          checkoutSessionId: session.id,
        },
      });

      // TODO: Notify maker of new order
      // await notifyMakerOrderPlaced(order.id, product.makerId, product.name, req.user?.name || 'مشتري');

      res.json({
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id,
        orderId: order.id,
        testMode: isTestMode,
        message: isTestMode
          ? 'This is a test payment. No real money will be charged.'
          : 'Checkout session created successfully',
      });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create checkout session',
        code: 'CHECKOUT_ERROR',
        ...(process.env.NODE_ENV === 'development' && { error: error instanceof Error ? error.message : 'Unknown error' }),
      });
    }
  }
);

// Webhook endpoint for Stripe
// Note: This route uses raw body parsing configured in index.ts
// The body is already parsed as Buffer by express.raw() middleware
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('STRIPE_WEBHOOK_SECRET is not set. Webhook verification skipped.');
    return res.status(400).json({
      success: false,
      message: 'Webhook secret not configured',
    });
  }

  try {
    const event = verifyWebhookSignature(req.body, sig, webhookSecret);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { product: true },
          });

          if (order) {
            await prisma.order.update({
              where: { id: orderId },
              data: {
                status: 'PAID',
                paymentIntentId: session.payment_intent as string,
              },
            });

            // Notify buyer and maker
            // TODO: await notifyOrderStatusChange(orderId, order.buyerId, 'PAID', order.product.name);
            // TODO: await notifyMakerOrderPlaced(orderId, order.product.makerId, order.product.name, order.buyer.name);
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Find order by payment intent ID
        const order = await prisma.order.findFirst({
          where: { paymentIntentId: paymentIntent.id },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'PAID',
            },
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const order = await prisma.order.findFirst({
          where: { paymentIntentId: paymentIntent.id },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'FAILED',
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({
      success: false,
      message: 'Webhook verification failed',
    });
  }
});

export default router;

