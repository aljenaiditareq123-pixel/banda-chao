import express, { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error('[Payments] WARNING: STRIPE_SECRET_KEY not set in environment variables');
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
}) : null;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * POST /api/v1/payments/create-checkout-session
 * Create a Stripe checkout session for the user's cart
 */
router.post('/create-checkout-session', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        error: 'Payment service unavailable',
        message: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.',
      });
    }

    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { items } = req.body; // Array of { productId: string, quantity: number }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Invalid cart',
        message: 'Cart items are required',
      });
    }

    // Fetch products and validate
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        error: 'Invalid products',
        message: 'Some products in your cart are no longer available',
      });
    }

    // Build line items and calculate total
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const orderItems: Array<{ productId: string; quantity: number; price: number }> = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) continue;

      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      const priceInCents = Math.round((product.price || 0) * 100); // Convert to cents/fils

      if (priceInCents <= 0) {
        return res.status(400).json({
          error: 'Invalid price',
          message: `Product "${product.name}" has an invalid price`,
        });
      }

      lineItems.push({
        price_data: {
          currency: 'aed', // UAE Dirhams
          product_data: {
            name: product.name,
            description: product.description || undefined,
            images: product.imageUrl ? [product.imageUrl] : undefined,
          },
          unit_amount: priceInCents,
        },
        quantity,
      });

      orderItems.push({
        productId: product.id,
        quantity,
        price: priceInCents, // Store in smallest currency unit
      });

      totalAmount += priceInCents * quantity;
    }

    if (lineItems.length === 0) {
      return res.status(400).json({
        error: 'Empty cart',
        message: 'Your cart is empty',
      });
    }

    // Create temporary order with PENDING status
    const order = await prisma.order.create({
      data: {
        userId,
        status: 'PENDING',
        totalAmount: totalAmount / 100, // Store as decimal for display
        orderItems: {
          create: orderItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price / 100, // Store as decimal
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Get user email from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/checkout/cancel`,
      metadata: {
        orderId: order.id,
        userId,
      },
      customer_email: user?.email || undefined,
    });

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeId: session.id },
    });

    res.json({
      sessionId: session.id,
      orderId: order.id,
    });
  } catch (error: any) {
    console.error('[Payments] Create checkout session error:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/payments/webhook
 * Handle Stripe webhooks (raw body required for signature verification)
 * This route must use raw body parser - configured in index.ts
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      console.error('[Payments] Webhook received but Stripe is not configured');
      return res.status(503).send('Payment service unavailable');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[Payments] WARNING: STRIPE_WEBHOOK_SECRET not set');
      return res.status(500).send('Webhook secret not configured');
    }

    const sig = req.headers['stripe-signature'];
    if (!sig) {
      return res.status(400).send('Missing stripe-signature header');
    }

    // req.body is a Buffer when using express.raw({ type: 'application/json' })
    const rawBody = req.body as Buffer;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
      console.error('[Payments] Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('[Payments] Checkout session completed:', session.id);
        
        // Update order status to PAID
        if (session.metadata?.orderId) {
          await prisma.order.update({
            where: { id: session.metadata.orderId },
            data: {
              status: 'PAID',
              stripeId: session.id,
            },
          });

          // Create notification for the user
          if (session.metadata?.userId) {
            await prisma.notification.create({
              data: {
                userId: session.metadata.userId,
                type: 'order_status',
                title: 'Order Confirmed',
                body: `Your order #${session.metadata.orderId.slice(0, 8)} has been confirmed!`,
                data: {
                  orderId: session.metadata.orderId,
                  status: 'PAID',
                },
              },
            });
          }
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('[Payments] Checkout session expired:', session.id);
        
        // Update order status to FAILED
        if (session.metadata?.orderId) {
          await prisma.order.update({
            where: { id: session.metadata.orderId },
            data: {
              status: 'FAILED',
            },
          });
        }
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('[Payments] Async payment failed:', session.id);
        
        // Update order status to FAILED
        if (session.metadata?.orderId) {
          await prisma.order.update({
            where: { id: session.metadata.orderId },
            data: {
              status: 'FAILED',
            },
          });
        }
        break;
      }

      default:
        console.log(`[Payments] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('[Payments] Webhook error:', error);
    res.status(500).send(`Webhook Error: ${error.message}`);
  }
});

export default router;

