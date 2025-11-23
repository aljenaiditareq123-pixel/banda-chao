import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { createNotification } from '../services/notifications';

const router = Router();

// Create a new order
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const {
      items, // Array of { productId, quantity }
      shippingName,
      shippingAddress,
      shippingCity,
      shippingCountry,
      shippingPhone,
    } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' });
    }

    if (!shippingName || !shippingAddress || !shippingCity || !shippingCountry) {
      return res.status(400).json({
        error: 'Shipping information is required (name, address, city, country)',
      });
    }

    // Validate and fetch products
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'One or more products not found' });
    }

    // Calculate total amount and validate items
    let totalAmount = 0;
    const orderItemsData: Array<{
      productId: string;
      quantity: number;
      price: number;
    }> = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return res.status(400).json({
          error: `Product ${item.productId} not found`,
        });
      }

      // Validate quantity: accept number or numeric string, must be positive integer <= 1000
      let quantity: number;
      if (typeof item.quantity === 'number') {
        quantity = Math.floor(Math.abs(item.quantity));
      } else if (typeof item.quantity === 'string') {
        quantity = parseInt(item.quantity, 10);
      } else {
        return res.status(400).json({
          error: `Invalid quantity for product ${item.productId}. Quantity must be a number.`,
        });
      }

      if (isNaN(quantity) || quantity <= 0 || quantity > 1000) {
        return res.status(400).json({
          error: `Invalid quantity for product ${item.productId}. Must be between 1 and 1000.`,
        });
      }

      // Reject products without a price (prevent bad data from entering the system)
      if (product.price === null || product.price === undefined) {
        return res.status(400).json({
          error: `Product ${item.productId} has no price defined`,
        });
      }

      const price = product.price;
      const itemTotal = price * quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        productId: product.id,
        quantity,
        price, // Snapshot price at time of order
      });
    }

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          totalAmount,
          shippingName,
          shippingAddress,
          shippingCity,
          shippingCountry,
          shippingPhone: shippingPhone || null,
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });

      return newOrder;
    });

    res.status(201).json({
      message: 'Order created successfully',
      data: order,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: error.message,
    });
  }
});

// Get current user's orders
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Return array directly for consistency with other endpoints
    res.json(orders);
  } catch (error: any) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      message: error.message,
    });
  }
});

// Get order by ID (only if it belongs to the current user)
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                imageUrl: true,
                externalLink: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Ensure user can only access their own orders
    if (order.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Return object directly for consistency with other endpoints
    res.json(order);
  } catch (error: any) {
    console.error('Get order error:', error);
    res.status(500).json({
      error: 'Failed to fetch order',
      message: error.message,
    });
  }
});

// Update order status
router.put('/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id: orderId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only order owner or admin can update status
    // For now, allow order owner to update (later can add admin check)
    if (order.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Don't allow updating if already cancelled or delivered
    if (order.status === 'CANCELLED' || order.status === 'DELIVERED') {
      return res.status(400).json({
        error: 'Cannot update status',
        message: `Order is already ${order.status}`,
      });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Create notification for order owner
    const statusMessages: Record<string, string> = {
      PROCESSING: 'جاري معالجة طلبك',
      SHIPPED: 'تم شحن طلبك',
      DELIVERED: 'تم تسليم طلبك',
      CANCELLED: 'تم إلغاء طلبك',
    };

    await createNotification({
      userId: order.userId,
      type: 'order_status',
      title: 'تحديث حالة طلبك',
      body: statusMessages[status] || `تم تحديث حالة طلبك إلى: ${status}`,
      data: {
        orderId,
        newStatus: status,
        previousStatus: order.status,
      },
    });

    res.json({
      message: 'Order status updated successfully',
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error('Update order status error:', error);
    res.status(500).json({
      error: 'Failed to update order status',
      message: error.message,
    });
  }
});

export default router;

