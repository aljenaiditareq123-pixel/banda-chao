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

