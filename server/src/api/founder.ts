import { Router, Request, Response } from 'express';
import { authenticateFounder, AuthRequest } from '../middleware/founderAuth';
import { prisma } from '../utils/prisma';

const router = Router();

/**
 * GET /api/v1/founder/analytics
 * Get platform analytics (FOUNDER only)
 */
router.get('/analytics', authenticateFounder, async (req: AuthRequest, res: Response) => {
  try {
    // Get total counts
    const [
      totalUsers,
      totalMakers,
      totalProducts,
      totalVideos,
      totalPosts,
      totalOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.maker.count(),
      prisma.product.count(),
      prisma.video.count(),
      prisma.post.count(),
      prisma.order.count(),
    ]);

    // Get orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
    });

    const orderStatusCounts = {
      PENDING: 0,
      PAID: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      FAILED: 0,
    };

    ordersByStatus.forEach((item) => {
      orderStatusCounts[item.status as keyof typeof orderStatusCounts] = item._count;
    });

    // Get daily signups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Get all users from last 30 days and group by date manually
    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Format daily signups for chart (group by date)
    const signupsByDate: Record<string, number> = {};
    recentUsers.forEach((user) => {
      const date = new Date(user.createdAt).toISOString().split('T')[0];
      signupsByDate[date] = (signupsByDate[date] || 0) + 1;
    });

    // Get top makers by product count
    const topMakersByProducts = await prisma.maker.findMany({
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });

    // Count products per maker
    const makersWithProductCounts = await Promise.all(
      topMakersByProducts.map(async (maker) => {
        const productCount = await prisma.product.count({
          where: { userId: maker.userId },
        });
        return {
          id: maker.id,
          name: maker.name,
          userId: maker.userId,
          user: maker.user,
          productCount,
        };
      })
    );

    // Sort by product count and take top 5
    const topMakers = makersWithProductCounts
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 5);

    // Get top products by order count
    const topProducts = await prisma.product.findMany({
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
      orderBy: {
        orderItems: {
          _count: 'desc',
        },
      },
    });

    // Get recent user signups (last 10)
    const recentSignups = await prisma.user.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        role: true,
        createdAt: true,
      },
    });

    // Get total revenue (sum of all PAID orders)
    const revenueResult = await prisma.order.aggregate({
      where: {
        status: 'PAID',
      },
      _sum: {
        totalAmount: true,
      },
    });

    const totalRevenue = revenueResult._sum.totalAmount || 0;

    res.json({
      summary: {
        totalUsers,
        totalMakers,
        totalProducts,
        totalVideos,
        totalPosts,
        totalOrders,
        totalRevenue,
      },
      orders: {
        byStatus: orderStatusCounts,
      },
      dailySignups: signupsByDate,
      topMakers,
      topProducts: topProducts.map((p) => ({
        id: p.id,
        name: p.name,
        userId: p.userId,
        makerName: p.user.name,
        orderCount: p._count.orderItems,
        price: p.price,
        imageUrl: p.imageUrl,
      })),
      recentSignups,
    });
  } catch (error: any) {
    console.error('[Founder Analytics] Error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error.message,
    });
  }
});

export default router;

