/**
 * Advisor Agent - الباندا المستشار
 * The strategic intelligence system for Banda Chao
 * 
 * Responsibilities:
 * - Analyze user behavior
 * - Generate market insights
 * - Provide strategic recommendations
 * - Forecast trends
 */

import { prisma } from '../../../utils/prisma';
import { generateFounderAIResponse } from '../../gemini';

export interface UserBehaviorEvent {
  userId: string;
  eventType: 'VIEW_PRODUCT' | 'ADD_TO_CART' | 'PURCHASE' | 'SEARCH' | 'CLICK' | 'VIEW_CATEGORY' | 'VIEW_MAKER';
  targetId?: string;
  targetType?: 'PRODUCT' | 'CATEGORY' | 'MAKER' | 'VIDEO' | 'POST';
  metadata?: Record<string, any>;
  sessionId?: string;
}

export interface MarketAnalysisResult {
  analysisType: string;
  category?: string;
  region?: string;
  data: Record<string, any>;
  insights?: string;
  confidenceScore?: number;
}

export interface Recommendation {
  type: 'PRODUCT' | 'CATEGORY' | 'PRICING' | 'MARKETING' | 'STRATEGIC';
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  actions?: string[];
  metadata?: Record<string, any>;
}

/**
 * Analyze and record user behavior
 * تحليل وتسجيل سلوك المستخدم
 */
export async function analyzeUserBehavior(event: UserBehaviorEvent): Promise<void> {
  try {
    // Store the insight in database
    await (prisma as any).customer_insights.create({
      data: {
        id: crypto.randomUUID(),
        user_id: event.userId,
        event_type: event.eventType,
        target_id: event.targetId || null,
        target_type: event.targetType || null,
        metadata: event.metadata ? JSON.stringify(event.metadata) : null,
        session_id: event.sessionId || null,
        created_at: new Date(),
      },
    });

    console.log(`[Advisor] User behavior recorded: ${event.eventType} for user ${event.userId}`);
  } catch (error) {
    console.error('[Advisor] Error analyzing user behavior:', error);
    // Don't throw - behavior tracking shouldn't break user flow
  }
}

/**
 * Get user behavior insights
 * الحصول على رؤى سلوك المستخدم
 */
export async function getUserBehaviorInsights(
  userId: string,
  days: number = 7
): Promise<{
  totalEvents: number;
  eventsByType: Record<string, number>;
  topCategories: Array<{ category: string; count: number }>;
  topProducts: Array<{ productId: string; count: number }>;
  purchaseRate: number;
}> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const insights = await (prisma as any).customer_insights.findMany({
      where: {
        user_id: userId,
        created_at: {
          gte: startDate,
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Analyze insights
    const eventsByType: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const productCounts: Record<string, number> = {};
    let purchaseCount = 0;

    insights.forEach((insight) => {
      // Count by event type
      eventsByType[insight.event_type] = (eventsByType[insight.event_type] || 0) + 1;

      // Count purchases
      if (insight.event_type === 'PURCHASE') {
        purchaseCount++;
      }

      // Count categories
      if (insight.target_type === 'CATEGORY' && insight.target_id) {
        categoryCounts[insight.target_id] = (categoryCounts[insight.target_id] || 0) + 1;
      }

      // Count products
      if (insight.target_type === 'PRODUCT' && insight.target_id) {
        productCounts[insight.target_id] = (productCounts[insight.target_id] || 0) + 1;
      }
    });

    // Get top categories
    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get top products
    const topProducts = Object.entries(productCounts)
      .map(([productId, count]) => ({ productId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate purchase rate
    const purchaseRate = insights.length > 0 ? purchaseCount / insights.length : 0;

    return {
      totalEvents: insights.length,
      eventsByType,
      topCategories,
      topProducts,
      purchaseRate,
    };
  } catch (error) {
    console.error('[Advisor] Error getting user behavior insights:', error);
    return {
      totalEvents: 0,
      eventsByType: {},
      topCategories: [],
      topProducts: [],
      purchaseRate: 0,
    };
  }
}

/**
 * Generate market analysis
 * توليد تحليل السوق
 */
export async function generateMarketAnalysis(
  analysisType: 'TREND' | 'COMPETITOR' | 'DEMAND' | 'PRICING',
  category?: string,
  region?: string
): Promise<MarketAnalysisResult> {
  try {
    // Get relevant data from database
    const products = await prisma.products.findMany({
      where: category ? { category_string: category } : undefined,
      include: {
        order_items: {
          select: { id: true },
        },
        product_likes: {
          select: { id: true },
        },
      },
    });

    // Calculate basic metrics
    const totalProducts = products.length;
    const totalOrders = products.reduce((sum, p) => sum + (p.order_items?.length || 0), 0);
    const totalLikes = products.reduce((sum, p) => sum + (p.product_likes?.length || 0), 0);
    const avgPrice = products.length > 0
      ? products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length
      : 0;

    // Build analysis data
    const analysisData = {
      totalProducts,
      totalOrders,
      totalLikes,
      avgPrice,
      category: category || 'ALL',
      region: region || 'GLOBAL',
      timestamp: new Date().toISOString(),
    };

    // Store analysis in database
    const analysis = await (prisma as any).market_analysis.create({
      data: {
        id: crypto.randomUUID(),
        analysis_type: analysisType,
        category: category || null,
        region: region || null,
        data: JSON.stringify(analysisData),
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return {
      analysisType,
      category,
      region,
      data: analysisData,
      confidenceScore: 0.7, // Default confidence
    };
  } catch (error) {
    console.error('[Advisor] Error generating market analysis:', error);
    throw error;
  }
}

/**
 * Generate recommendation (Structure ready for AI integration)
 * توليد توصية (هيكل جاهز لربط AI)
 */
export async function generateRecommendation(
  context: {
    userId?: string;
    category?: string;
    productId?: string;
    type: 'PRODUCT' | 'CATEGORY' | 'PRICING' | 'MARKETING' | 'STRATEGIC';
  }
): Promise<Recommendation> {
  try {
    // For now, return a basic recommendation structure
    // TODO: Integrate with OpenAI/Gemini for intelligent recommendations

    let recommendation: Recommendation;

    switch (context.type) {
      case 'PRODUCT':
        recommendation = {
          type: 'PRODUCT',
          title: 'توصية منتج',
          description: 'بناءً على تحليل سلوك المستخدمين، نوصي بتعزيز عرض المنتجات في هذه الفئة.',
          priority: 'MEDIUM',
          confidence: 0.6,
          actions: ['زيادة المخزون', 'تحسين الصور', 'إضافة خصومات'],
        };
        break;

      case 'PRICING':
        recommendation = {
          type: 'PRICING',
          title: 'توصية تسعير',
          description: 'تحليل الأسعار يشير إلى إمكانية تحسين الإيرادات من خلال تعديل الأسعار.',
          priority: 'HIGH',
          confidence: 0.7,
          actions: ['مراجعة الأسعار', 'تحليل المنافسين', 'اختبار أسعار جديدة'],
        };
        break;

      case 'MARKETING':
        recommendation = {
          type: 'MARKETING',
          title: 'توصية تسويقية',
          description: 'تحليل السوق يشير إلى فرص تسويقية في هذه الفئة.',
          priority: 'MEDIUM',
          confidence: 0.65,
          actions: ['حملة إعلانية', 'تعزيز المحتوى', 'شراكات استراتيجية'],
        };
        break;

      case 'STRATEGIC':
        recommendation = {
          type: 'STRATEGIC',
          title: 'توصية استراتيجية',
          description: 'تحليل شامل يشير إلى اتجاهات مهمة في السوق.',
          priority: 'HIGH',
          confidence: 0.8,
          actions: ['مراجعة الاستراتيجية', 'تحديث الخطة', 'توسيع النطاق'],
        };
        break;

      default:
        recommendation = {
          type: 'CATEGORY',
          title: 'توصية فئة',
          description: 'تحليل الفئات يشير إلى فرص نمو.',
          priority: 'LOW',
          confidence: 0.5,
        };
    }

    // TODO: Enhance with AI-generated insights using Gemini
    // const aiPrompt = `Based on the following context, generate a strategic recommendation...`;
    // const aiResponse = await generateFounderAIResponse(aiPrompt);
    // recommendation.description = aiResponse;

    return recommendation;
  } catch (error) {
    console.error('[Advisor] Error generating recommendation:', error);
    throw error;
  }
}

/**
 * Get active user behavior insights (for dashboard)
 * الحصول على رؤى سلوك المستخدمين النشطين
 */
export async function getActiveUserInsights(days: number = 7): Promise<{
  totalActiveUsers: number;
  topEvents: Array<{ eventType: string; count: number }>;
  conversionRate: number;
  topCategories: Array<{ category: string; count: number }>;
}> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const insights = await (prisma as any).customer_insights.findMany({
      where: {
        created_at: {
          gte: startDate,
        },
      },
    });

    // Get unique users
    const uniqueUsers = new Set(insights.map((i) => i.user_id));
    const totalActiveUsers = uniqueUsers.size;

    // Count events by type
    const eventCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    let purchaseCount = 0;
    let viewCount = 0;

    insights.forEach((insight) => {
      eventCounts[insight.event_type] = (eventCounts[insight.event_type] || 0) + 1;

      if (insight.event_type === 'PURCHASE') {
        purchaseCount++;
      }
      if (insight.event_type === 'VIEW_PRODUCT' || insight.event_type === 'VIEW_CATEGORY') {
        viewCount++;
      }

      // Parse metadata for category if available
      if (insight.metadata) {
        try {
          const metadata = JSON.parse(insight.metadata);
          if (metadata.category) {
            categoryCounts[metadata.category] = (categoryCounts[metadata.category] || 0) + 1;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    });

    const topEvents = Object.entries(eventCounts)
      .map(([eventType, count]) => ({ eventType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const conversionRate = viewCount > 0 ? purchaseCount / viewCount : 0;

    return {
      totalActiveUsers,
      topEvents,
      conversionRate,
      topCategories,
    };
  } catch (error) {
    console.error('[Advisor] Error getting active user insights:', error);
    return {
      totalActiveUsers: 0,
      topEvents: [],
      conversionRate: 0,
      topCategories: [],
    };
  }
}

/**
 * Get latest market analyses
 * الحصول على آخر تحليلات السوق
 */
export async function getLatestMarketAnalyses(limit: number = 5): Promise<MarketAnalysisResult[]> {
  try {
    const analyses = await (prisma as any).market_analysis.findMany({
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
    });

    return analyses.map((analysis) => ({
      analysisType: analysis.analysis_type,
      category: analysis.category || undefined,
      region: analysis.region || undefined,
      data: JSON.parse(analysis.data),
      insights: analysis.insights || undefined,
      confidenceScore: analysis.confidence_score || undefined,
    }));
  } catch (error) {
    console.error('[Advisor] Error getting latest market analyses:', error);
    return [];
  }
}
