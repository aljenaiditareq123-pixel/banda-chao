import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../utils/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { checkoutSchema } from '../validation/paymentSchemas';
import { createCheckoutSession, verifyWebhookSignature, isTestMode } from '../lib/stripe';
import { calculateRevenue } from '../config/commerceConfig';
import { getIO } from '../realtime/socket';

const router = Router();

/**
 * Notify maker when an order is placed
 */
async function notifyMakerOrderPlaced(orderId: string, makerId: string, productName: string, buyerName: string) {
  try {
    // Get maker's user ID
    const maker = await prisma.maker.findUnique({
      where: { id: makerId },
      include: { user: true },
    });

    if (maker?.user) {
      // Create notification in database
      const notification = await prisma.notification.create({
        data: {
          userId: maker.user.id,
          type: 'order-placed',
          title: 'طلب جديد',
          body: `تم طلب منتجك "${productName}" من ${buyerName}`,
          metadata: {
            orderId,
            productName,
            buyerName,
          },
        },
      });

      // Emit Socket.IO event for real-time notification
      const io = getIO();
      io?.to(`user:${maker.user.id}`).emit('notification', notification);
    }
  } catch (error) {
    console.error('Error notifying maker of order:', error);
    // Don't throw - notification failure shouldn't break order creation
  }
}

/**
 * Notify user when order status changes
 */
async function notifyOrderStatusChange(orderId: string, userId: string, status: string, productName: string) {
  try {
    const statusMessages: Record<string, { title: string; body: string }> = {
      PAID: {
        title: 'تم تأكيد الدفع',
        body: `تم تأكيد دفع طلبك للمنتج "${productName}"`,
      },
      FAILED: {
        title: 'فشل الدفع',
        body: `فشل دفع طلبك للمنتج "${productName}". يرجى المحاولة مرة أخرى.`,
      },
      CANCELLED: {
        title: 'تم إلغاء الطلب',
        body: `تم إلغاء طلبك للمنتج "${productName}"`,
      },
      SHIPPED: {
        title: 'تم الشحن',
        body: `تم شحن طلبك للمنتج "${productName}"`,
      },
      DELIVERED: {
        title: 'تم التوصيل',
        body: `تم توصيل طلبك للمنتج "${productName}"`,
      },
    };

    const message = statusMessages[status];
    if (message) {
      // Create notification in database
      const notification = await prisma.notification.create({
        data: {
          userId,
          type: 'order-update',
          title: message.title,
          body: message.body,
          metadata: {
            orderId,
            status,
            productName,
          },
        },
      });

      // Emit Socket.IO event for real-time notification
      const io = getIO();
      io?.to(`user:${userId}`).emit('notification', notification);
    }
  } catch (error) {
    console.error('Error notifying order status change:', error);
    // Don't throw - notification failure shouldn't break order update
  }
}

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

      // Notify maker of new order
      await notifyMakerOrderPlaced(order.id, product.makerId, product.name, req.user?.name || 'مشتري');

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
            // Get buyer information for notification
            const buyer = await prisma.user.findUnique({
              where: { id: order.buyerId },
              select: { name: true },
            });

            await prisma.order.update({
              where: { id: orderId },
              data: {
                status: 'PAID',
                paymentIntentId: session.payment_intent as string,
              },
            });

            // Notify buyer and maker
            await notifyOrderStatusChange(orderId, order.buyerId, 'PAID', order.product.name);
            await notifyMakerOrderPlaced(orderId, order.product.makerId, order.product.name, buyer?.name || 'مشتري');
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Find order by payment intent ID
        const order = await prisma.order.findFirst({
          where: { paymentIntentId: paymentIntent.id },
          include: { product: true },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'PAID',
            },
          });

          // Notify buyer of payment success
          await notifyOrderStatusChange(order.id, order.buyerId, 'PAID', order.product.name);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const order = await prisma.order.findFirst({
          where: { paymentIntentId: paymentIntent.id },
          include: { product: true },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'FAILED',
            },
          });

          // Notify buyer of payment failure
          await notifyOrderStatusChange(order.id, order.buyerId, 'FAILED', order.product.name);
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

