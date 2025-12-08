import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Get orders (for founder/admin)
router.get('/', authenticateToken, requireRole(['FOUNDER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const skip = (page - 1) * pageSize;
    const status = req.query.status as string;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [orders, total, stats] = await Promise.all([
      prisma.orders.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          order_items: {
            include: {
              products: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
          users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.orders.count({ where }),
      prisma.orders.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
      }),
    ]);

    const statsObj = {
      total: total,
      paid: stats.find((s: { status: string; _count: { id: number } }) => s.status === 'PAID')?._count.id || 0,
    };

    res.json({
      success: true,
      orders,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      stats: statsObj,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
    });
  }
});

// Get current user's orders (buyer)
router.get('/my', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const orders = await prisma.orders.findMany({
      where: { user_id: userId },
      include: {
        order_items: {
          include: {
            products: {
              include: {
                users: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
    });
  }
});

// Create order (POST /orders)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    console.log('[Orders] ✅ Payment Request Received - Create order endpoint called');
    console.log('[Orders] Request details:', {
      method: req.method,
      path: req.path,
      hasUser: !!req.user,
      userId: req.user?.id,
      userEmail: req.user?.email,
      body: req.body,
      headers: {
        origin: req.headers.origin,
        authorization: req.headers.authorization ? 'Present' : 'Missing',
        'authorization-preview': req.headers.authorization ? req.headers.authorization.substring(0, 20) + '...' : 'Missing',
      },
    });

    const userId = req.user?.id;
    if (!userId) {
      console.error('[Orders] ❌ Unauthorized: No user ID found');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Please log in to create order',
        code: 'UNAUTHORIZED',
      });
    }

    const { items, shipping, payment, total } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required',
        code: 'MISSING_ITEMS',
      });
    }

    if (!shipping || !shipping.name || !shipping.address || !shipping.city || !shipping.country || !shipping.zip) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required',
        code: 'MISSING_SHIPPING',
      });
    }

    // Create order in database
    const { randomUUID } = await import('crypto');
    const orderId = randomUUID();

    // Calculate total from items if not provided
    const calculatedTotal = total || items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    const order = await prisma.orders.create({
      data: {
        id: orderId,
        user_id: userId,
        status: 'PENDING',
        totalAmount: calculatedTotal,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Create order items
    const orderItems = await Promise.all(
      items.map(async (item: any) => {
        const itemId = randomUUID();
        return prisma.order_items.create({
          data: {
            id: itemId,
            order_id: order.id,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price * item.quantity,
            created_at: new Date(),
          },
        });
      })
    );

    console.log('[Orders] ✅ Order created successfully:', {
      orderId: order.id,
      userId: order.user_id,
      total: order.totalAmount,
      itemsCount: orderItems.length,
    });

    res.json({
      success: true,
      orderId: order.id,
      id: order.id,
      message: 'Order created successfully',
      order: {
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        items: orderItems,
      },
    });
  } catch (error: any) {
    console.error('[Orders] ❌ Error creating order:', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      code: 'ORDER_CREATION_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Get maker's orders (orders for maker's products)
router.get('/maker', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const maker = await prisma.makers.findFirst({
      where: { user_id: userId },
    });

    if (!maker) {
      return res.status(404).json({
        success: false,
        message: 'Maker profile not found',
      });
    }

    const orders = await prisma.orders.findMany({
      where: {
        order_items: {
          some: {
            products: {
              user_id: maker.user_id,
            },
          },
        },
      },
      include: {
        order_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Error fetching maker orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maker orders',
    });
  }
});

export default router;

