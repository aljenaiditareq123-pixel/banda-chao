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
    const maker = await prisma.makers.findUnique({
      where: { id: makerId },
      include: { users: true },
    });

    if (maker?.users) {
      // Create notification in database
      const { randomUUID } = await import('crypto');
      const notification = await prisma.notifications.create({
        data: {
          id: randomUUID(),
          user_id: maker.users.id,
          type: 'order-placed',
          title: 'طلب جديد',
          body: `تم طلب منتجك "${productName}" من ${buyerName}`,
          data: {
            orderId,
            productName,
            buyerName,
          },
          is_read: false,
          created_at: new Date(),
        },
      });

      // Emit Socket.IO event for real-time notification
      const io = getIO();
      io?.to(`user:${maker.users.id}`).emit('notification', notification);
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
      const { randomUUID } = await import('crypto');
      const notification = await prisma.notifications.create({
        data: {
          id: randomUUID(),
          user_id: userId,
          type: 'order-update',
          title: message.title,
          body: message.body,
          data: {
            orderId,
            status,
            productName,
          },
          is_read: false,
          created_at: new Date(),
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
      const product = await prisma.products.findUnique({
        where: { id: productId },
        include: {
          users: {
            select: {
              name: true,
              email: true,
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

      // Calculate total price (products table doesn't have status or stock fields)
      if (!product.price) {
        return res.status(400).json({
          success: false,
          message: 'Product price not available',
          code: 'PRODUCT_PRICE_MISSING',
        });
      }

      // Inventory validation: Check available stock
      // Initialize quantities map before use
      const quantities: Record<string, number> = {};
      
      // Get ordered quantities for this product
      const orderedItems = await prisma.order_items.findMany({
        where: {
          product_id: productId,
          orders: {
            status: {
              in: ['PENDING', 'PAID'],
            },
          },
        },
        select: {
          quantity: true,
        },
      });

      // Calculate total ordered quantity
      const totalOrdered = orderedItems.reduce((sum, item) => sum + item.quantity, 0);
      quantities[productId] = totalOrdered;

      // Note: Since products table doesn't have stock field, we skip stock validation
      // In a real system, you would check: if (availableStock < quantity) { return error; }

      const totalPrice = product.price * quantity;

      // Calculate revenue split
      const { platformFee, makerRevenue } = calculateRevenue(totalPrice, currency);

      // Create order in database
      const { randomUUID } = await import('crypto');
      const orderId = randomUUID();
      const orderItemId = randomUUID();
      
      const order = await prisma.orders.create({
        data: {
          id: orderId,
          user_id: userId,
          status: 'PENDING',
          totalAmount: totalPrice,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // Create order item
      await prisma.order_items.create({
        data: {
          id: orderItemId,
          order_id: order.id,
          product_id: productId,
          quantity: quantity,
          price: totalPrice,
          created_at: new Date(),
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

      // Update order with checkout session ID (stored in stripe_id field)
      await prisma.orders.update({
        where: { id: order.id },
        data: {
          stripe_id: session.id,
          updated_at: new Date(),
        },
      });

      // Notify maker of new order
      await notifyMakerOrderPlaced(order.id, product.user_id, product.name, req.user?.name || 'مشتري');

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
          const order = await prisma.orders.findUnique({
            where: { id: orderId },
            include: { 
              order_items: {
                include: {
                  products: true,
                },
              },
            },
          });

          if (order && order.order_items.length > 0) {
            const product = order.order_items[0].products;
            // Get buyer information for notification
            const buyer = await prisma.users.findUnique({
              where: { id: order.user_id },
              select: { name: true },
            });

            await prisma.orders.update({
              where: { id: orderId },
              data: {
                status: 'PAID',
                stripe_id: session.payment_intent as string,
                updated_at: new Date(),
              },
            });

            // Notify buyer and maker
            await notifyOrderStatusChange(orderId, order.user_id, 'PAID', product.name);
            await notifyMakerOrderPlaced(orderId, product.user_id, product.name, buyer?.name || 'مشتري');
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Find order by payment intent ID
        const order = await prisma.orders.findFirst({
          where: { stripe_id: paymentIntent.id },
          include: { 
            order_items: {
              include: {
                products: true,
              },
            },
          },
        });

        if (order && order.order_items.length > 0) {
          const product = order.order_items[0].products;
          await prisma.orders.update({
            where: { id: order.id },
            data: {
              status: 'PAID',
              updated_at: new Date(),
            },
          });

          // Notify buyer of payment success
          await notifyOrderStatusChange(order.id, order.user_id, 'PAID', product.name);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const order = await prisma.orders.findFirst({
          where: { stripe_id: paymentIntent.id },
          include: { 
            order_items: {
              include: {
                products: true,
              },
            },
          },
        });

        if (order && order.order_items.length > 0) {
          const product = order.order_items[0].products;
          await prisma.orders.update({
            where: { id: order.id },
            data: {
              status: 'FAILED',
              updated_at: new Date(),
            },
          });

          // Notify buyer of payment failure
          await notifyOrderStatusChange(order.id, order.user_id, 'FAILED', product.name);
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

