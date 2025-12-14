/**
 * Advisor Service - خدمة المستشار الذكي
 * Core data analysis logic for the Advisor AI Agent
 * 
 * This service handles:
 * - Market trend analysis
 * - User behavior analysis
 * - Product performance analysis
 * - Strategic recommendations generation
 */

import { prisma } from '../utils/prisma';

export interface MarketTrendData {
  category?: string;
  region?: string;
  timeRange: '7d' | '30d' | '90d' | '1y';
  metrics: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    avgPrice: number;
    conversionRate: number;
    growthRate: number;
  };
}

export interface UserBehaviorData {
  userId: string;
  timeRange: '7d' | '30d' | '90d';
  metrics: {
    totalEvents: number;
    eventsByType: Record<string, number>;
    topCategories: Array<{ category: string; count: number }>;
    topProducts: Array<{ productId: string; count: number }>;
    purchaseRate: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
}

export interface ProductPerformanceData {
  productId: string;
  timeRange: '7d' | '30d' | '90d';
  metrics: {
    views: number;
    likes: number;
    shares: number;
    addToCart: number;
    purchases: number;
    revenue: number;
    conversionRate: number;
    avgRating: number;
  };
}

/**
 * Analyze market trends
 * تحليل اتجاهات السوق
 */
export async function analyzeMarketTrends(
  category?: string,
  region?: string,
  timeRange: '7d' | '30d' | '90d' | '1y' = '30d'
): Promise<MarketTrendData> {
  try {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get products in category
    const products = await prisma.products.findMany({
      where: {
        category_id: category || undefined,
        created_at: {
          gte: startDate,
        },
      },
      include: {
        order_items: true,
      },
    });

    // Get previous period for comparison
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(startDate);
    previousStartDate.setTime(previousStartDate.getTime() - (now.getTime() - startDate.getTime()));

    const previousProducts = await prisma.products.findMany({
      where: {
        category_id: category || undefined,
        created_at: {
          gte: previousStartDate,
          lt: previousEndDate,
        },
      },
      include: {
        order_items: true,
      },
    });

    // Calculate current metrics
    const totalProducts = products.length;
    const totalOrders = products.reduce((sum: number, p: any) => sum + (p.order_items?.length || 0), 0);
    const totalRevenue = products.reduce((sum: number, p: any) => {
      return sum + (p.order_items?.reduce((orderSum: number, item: any) => orderSum + ((item.price || 0) * (item.quantity || 0)), 0) || 0);
    }, 0);
    const avgPrice = products.length > 0
      ? products.reduce((sum: number, p: any) => sum + (p.price || 0), 0) / products.length
      : 0;

    // Calculate views and conversions
    const totalViews = products.reduce((sum: number, p: any) => sum + ((p as any).views_count || 0), 0);
    const conversionRate = totalViews > 0 ? totalOrders / totalViews : 0;

    // Calculate previous period metrics
    const previousTotalProducts = previousProducts.length;
    const previousTotalOrders = previousProducts.reduce((sum: number, p: any) => sum + (p.order_items?.length || 0), 0);
    const growthRate = previousTotalProducts > 0
      ? ((totalProducts - previousTotalProducts) / previousTotalProducts) * 100
      : 0;

    return {
      category,
      region,
      timeRange,
      metrics: {
        totalProducts,
        totalOrders,
        totalRevenue,
        avgPrice,
        conversionRate,
        growthRate,
      },
    };
  } catch (error) {
    console.error('[AdvisorService] Error analyzing market trends:', error);
    throw error;
  }
}

/**
 * Analyze user behavior patterns
 * تحليل أنماط سلوك المستخدم
 */
export async function analyzeUserBehavior(
  userId: string,
  timeRange: '7d' | '30d' | '90d' = '30d'
): Promise<UserBehaviorData> {
  try {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
    }

    // Get user insights
    const insights = await prisma.customer_insights.findMany({
      where: {
        user_id: userId,
        created_at: {
          gte: startDate,
        },
      },
    });

    // Analyze insights
    const eventsByType: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const productCounts: Record<string, number> = {};
    let purchaseCount = 0;
    let viewCount = 0;

    insights.forEach((insight: any) => {
      eventsByType[insight.event_type] = (eventsByType[insight.event_type] || 0) + 1;

      if (insight.event_type === 'PURCHASE') {
        purchaseCount++;
      }
      if (insight.event_type === 'VIEW_PRODUCT' || insight.event_type === 'VIEW_CATEGORY') {
        viewCount++;
      }

      if (insight.target_type === 'CATEGORY' && insight.target_id) {
        categoryCounts[insight.target_id] = (categoryCounts[insight.target_id] || 0) + 1;
      }

      if (insight.target_type === 'PRODUCT' && insight.target_id) {
        productCounts[insight.target_id] = (productCounts[insight.target_id] || 0) + 1;
      }
    });

    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topProducts = Object.entries(productCounts)
      .map(([productId, count]) => ({ productId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const purchaseRate = insights.length > 0 ? purchaseCount / insights.length : 0;
    const bounceRate = viewCount > 0 ? (viewCount - purchaseCount) / viewCount : 0;

    // Calculate session duration (mock for now - would need session tracking)
    const avgSessionDuration = insights.length > 0 ? insights.length * 2 : 0; // minutes

    return {
      userId,
      timeRange,
      metrics: {
        totalEvents: insights.length,
        eventsByType,
        topCategories,
        topProducts,
        purchaseRate,
        avgSessionDuration,
        bounceRate,
      },
    };
  } catch (error) {
    console.error('[AdvisorService] Error analyzing user behavior:', error);
    throw error;
  }
}

/**
 * Analyze product performance
 * تحليل أداء المنتج
 */
export async function analyzeProductPerformance(
  productId: string,
  timeRange: '7d' | '30d' | '90d' = '30d'
): Promise<ProductPerformanceData> {
  try {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
    }

    // Get product with related data
    const product = await prisma.products.findUnique({
      where: { id: productId },
      include: {
        order_items: {
          where: {
            created_at: {
              gte: startDate,
            },
          },
          include: {
            orders: true,
          },
        },
        product_likes: {
          where: {
            created_at: {
              gte: startDate,
            },
          },
        },
        post_products: {
          include: {
            posts: true,
          },
        },
        video_products: {
          include: {
            videos: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Calculate metrics
    const views = (product as any).views_count || 0;
    const likes = (product as any).product_likes?.length || 0;
    // Shares calculation simplified - shares table is polymorphic
    const sharesCount = await prisma.shares.count({
      where: {
        target_type: 'PRODUCT',
        target_id: productId,
      },
    });
    const shares = sharesCount;
    
    // Get add to cart events
    const addToCartEvents = await (prisma as any).customer_insights.count({
      where: {
        target_id: productId,
        target_type: 'PRODUCT',
        event_type: 'ADD_TO_CART',
        created_at: {
          gte: startDate,
        },
      },
    });

    const purchases = (product as any).order_items?.length || 0;
    const revenue = (product as any).order_items?.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 0)), 0) || 0;
    const conversionRate = views > 0 ? purchases / views : 0;

    return {
      productId,
      timeRange,
      metrics: {
        views,
        likes,
        shares,
        addToCart: addToCartEvents,
        purchases,
        revenue,
        conversionRate,
        avgRating: product.rating || 0,
      },
    };
  } catch (error) {
    console.error('[AdvisorService] Error analyzing product performance:', error);
    throw error;
  }
}

/**
 * Generate strategic insights from multiple data sources
 * توليد رؤى استراتيجية من مصادر بيانات متعددة
 */
export async function generateStrategicInsights(
  category?: string,
  timeRange: '7d' | '30d' | '90d' = '30d'
): Promise<{
  marketTrends: MarketTrendData;
  topProducts: Array<{ productId: string; metrics: ProductPerformanceData['metrics'] }>;
  recommendations: string[];
}> {
  try {
    // Get market trends
    const marketTrends = await analyzeMarketTrends(category, undefined, timeRange);

    // Get top products in category
    const topProducts = await prisma.products.findMany({
      where: {
        category_id: category || undefined,
      },
      orderBy: {
        sold_count: 'desc',
      },
      take: 5,
    });

    // Analyze each top product
    const topProductsAnalysis = await Promise.all(
      topProducts.map(async (product) => ({
        productId: product.id,
        metrics: (await analyzeProductPerformance(product.id, timeRange)).metrics,
      }))
    );

    // Generate recommendations based on analysis
    const recommendations: string[] = [];

    if (marketTrends.metrics.growthRate > 20) {
      recommendations.push('السوق في نمو قوي - فرصة للتوسع في هذه الفئة');
    }

    if (marketTrends.metrics.conversionRate < 0.02) {
      recommendations.push('معدل التحويل منخفض - يحتاج تحسين في العرض والتسويق');
    }

    if (marketTrends.metrics.avgPrice < marketTrends.metrics.totalRevenue / marketTrends.metrics.totalOrders) {
      recommendations.push('الأسعار منخفضة نسبياً - إمكانية زيادة الأسعار');
    }

    return {
      marketTrends,
      topProducts: topProductsAnalysis,
      recommendations,
    };
  } catch (error) {
    console.error('[AdvisorService] Error generating strategic insights:', error);
    throw error;
  }
}
