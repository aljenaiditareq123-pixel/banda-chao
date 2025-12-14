/**
 * Treasurer Service - خدمة الخازن المالي
 * Dynamic pricing and financial management for Banda Chao
 * 
 * This service handles:
 * - Dynamic price calculation based on rules
 * - Revenue optimization
 * - Financial analysis
 * - Pricing rule evaluation
 */

import { prisma } from '../utils/prisma';
import { checkTransactionRisk, logSuspiciousTransaction } from './fraudService';

export interface PricingContext {
  userId?: string;
  productId?: string;
  categoryId?: string;
  quantity?: number;
  orderValue?: number;
  userType?: 'NEW' | 'RETURNING' | 'VIP';
  season?: string;
  timeWindow?: string;
}

export interface PriceCalculation {
  originalPrice: number;
  finalPrice: number;
  discount: number;
  discountPercentage: number;
  appliedRules: Array<{
    ruleName: string;
    ruleType: string;
    discount: number;
  }>;
  currency: string;
}

/**
 * Calculate dynamic price for a product
 * حساب السعر الديناميكي للمنتج
 */
export async function calculateDynamicPrice(
  productId: string,
  context: PricingContext
): Promise<PriceCalculation> {
  try {
    // Get product
    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product || !product.price) {
      throw new Error('Product not found or has no price');
    }

    const originalPrice = product.price;
    let finalPrice = originalPrice;
    const appliedRules: PriceCalculation['appliedRules'] = [];

    // Get all active pricing rules
    const activeRules = await (prisma as any).pricing_rules.findMany({
      where: {
        is_active: true,
        OR: [
          { product_id: productId },
          { category_id: (product as any).category_id || null },
          { product_id: null, category_id: null }, // Global rules
        ],
        AND: [
          {
            OR: [
              { valid_from: null },
              { valid_from: { lte: new Date() } },
            ],
          },
          {
            OR: [
              { valid_until: null },
              { valid_until: { gte: new Date() } },
            ],
          },
        ],
      },
      orderBy: {
        priority: 'desc', // Higher priority first
      },
    });

    // Evaluate each rule
    for (const rule of activeRules) {
      const conditions = JSON.parse(rule.conditions);
      const actions = JSON.parse(rule.actions);

      // Check if rule conditions are met
      if (evaluateRuleConditions(conditions, context, product)) {
        // Apply rule actions
        const discount = calculateDiscount(originalPrice, actions, context);
        
        if (discount > 0) {
          finalPrice = Math.max(0, finalPrice - discount);
          appliedRules.push({
            ruleName: rule.rule_name,
            ruleType: rule.rule_type,
            discount,
          });
        }
      }
    }

    // Ensure final price doesn't go below 0
    finalPrice = Math.max(0, finalPrice);

    const totalDiscount = originalPrice - finalPrice;
    const discountPercentage = originalPrice > 0 
      ? (totalDiscount / originalPrice) * 100 
      : 0;

    return {
      originalPrice,
      finalPrice,
      discount: totalDiscount,
      discountPercentage,
      appliedRules,
      currency: (product as any).currency || 'USD',
    };
  } catch (error) {
    console.error('[TreasurerService] Error calculating dynamic price:', error);
    throw error;
  }
}

/**
 * Evaluate if rule conditions are met
 * تقييم شروط القاعدة
 */
function evaluateRuleConditions(
  conditions: Record<string, any>,
  context: PricingContext,
  product: any
): boolean {
  // Check user type
  if (conditions.userType && context.userType !== conditions.userType) {
    return false;
  }

  // Check minimum order value
  if (conditions.minOrderValue && (context.orderValue || 0) < conditions.minOrderValue) {
    return false;
  }

  // Check minimum quantity
  if (conditions.minQuantity && (context.quantity || 0) < conditions.minQuantity) {
    return false;
  }

  // Check category
  if (conditions.category && product.category?.slug !== conditions.category) {
    return false;
  }

  // Check season
  if (conditions.season && context.season !== conditions.season) {
    return false;
  }

  // Check time window
  if (conditions.timeWindow && context.timeWindow !== conditions.timeWindow) {
    return false;
  }

  return true;
}

/**
 * Calculate discount based on rule actions
 * حساب الخصم بناءً على إجراءات القاعدة
 */
function calculateDiscount(
  originalPrice: number,
  actions: Record<string, any>,
  context: PricingContext
): number {
  const discountType = actions.discountType;
  const discountValue = actions.discountValue || 0;
  const maxDiscount = actions.maxDiscount || Infinity;

  let discount = 0;

  switch (discountType) {
    case 'PERCENTAGE':
      discount = (originalPrice * discountValue) / 100;
      break;
    case 'FIXED':
      discount = discountValue;
      break;
    default:
      discount = 0;
  }

  // Apply maximum discount limit
  discount = Math.min(discount, maxDiscount);

  return discount;
}

/**
 * Get user type for pricing context
 * الحصول على نوع المستخدم لسياق التسعير
 */
export async function getUserType(userId: string): Promise<'NEW' | 'RETURNING' | 'VIP'> {
  try {
    if (!userId) {
      return 'NEW';
    }

    // Check user's order history
    const orderCount = await prisma.orders.count({
      where: {
        user_id: userId,
        status: 'PAID',
      },
    });

    if (orderCount === 0) {
      return 'NEW';
    }

    // Check if user is VIP (has high order value or many orders)
    const totalSpent = await prisma.orders.aggregate({
      where: {
        user_id: userId,
        status: 'PAID',
      },
      _sum: {
        totalAmount: true,
      },
    });

    if (orderCount >= 10 || (totalSpent._sum.totalAmount || 0) >= 1000) {
      return 'VIP';
    }

    return 'RETURNING';
  } catch (error) {
    console.error('[TreasurerService] Error getting user type:', error);
    return 'NEW';
  }
}

/**
 * Get all active pricing rules
 * الحصول على جميع قواعد التسعير النشطة
 */
export async function getActivePricingRules(filters?: {
  ruleType?: string;
  productId?: string;
  categoryId?: string;
}) {
  try {
    const rules = await (prisma as any).pricing_rules.findMany({
      where: {
        is_active: true,
        rule_type: filters?.ruleType,
        product_id: filters?.productId,
        category_id: filters?.categoryId,
        AND: [
          {
            OR: [
              { valid_from: null },
              { valid_from: { lte: new Date() } },
            ],
          },
          {
            OR: [
              { valid_until: null },
              { valid_until: { gte: new Date() } },
            ],
          },
        ],
      },
      orderBy: {
        priority: 'desc',
      },
    });

    return rules.map((rule) => ({
      id: rule.id,
      ruleName: rule.rule_name,
      ruleType: rule.rule_type,
      conditions: JSON.parse(rule.conditions),
      actions: JSON.parse(rule.actions),
      priority: rule.priority,
      validFrom: rule.valid_from,
      validUntil: rule.valid_until,
    }));
  } catch (error) {
    console.error('[TreasurerService] Error getting active pricing rules:', error);
    throw error;
  }
}

/**
 * Calculate revenue optimization suggestions
 * حساب اقتراحات تحسين الإيرادات
 */
export async function calculateRevenueOptimization(
  categoryId?: string,
  timeRange: '7d' | '30d' | '90d' = '30d'
): Promise<{
  currentRevenue: number;
  potentialRevenue: number;
  optimizationSuggestions: Array<{
    type: string;
    description: string;
    potentialIncrease: number;
  }>;
}> {
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

    // Get orders in time range
    const orders = await prisma.orders.findMany({
      where: {
        status: 'PAID',
        created_at: {
          gte: startDate,
        },
        order_items: categoryId
          ? {
              some: {
                products: {
                  category_id: categoryId,
                } as any,
              },
            }
          : undefined,
      },
      include: {
        order_items: {
          include: {
            products: true,
          },
        },
      },
    });

    const currentRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate potential revenue with optimized pricing
    // This is a simplified calculation - in reality, would use ML models
    const avgOrderValue = orders.length > 0 ? currentRevenue / orders.length : 0;
    const potentialIncrease = avgOrderValue * 0.1; // 10% potential increase
    const potentialRevenue = currentRevenue + (potentialIncrease * orders.length);

    const optimizationSuggestions = [
      {
        type: 'PRICING',
        description: 'تطبيق خصومات ديناميكية للعملاء الجدد',
        potentialIncrease: potentialIncrease * 0.3,
      },
      {
        type: 'BUNDLING',
        description: 'عروض حزم المنتجات',
        potentialIncrease: potentialIncrease * 0.2,
      },
      {
        type: 'UPSELL',
        description: 'اقتراح منتجات مكملة',
        potentialIncrease: potentialIncrease * 0.5,
      },
    ];

    return {
      currentRevenue,
      potentialRevenue,
      optimizationSuggestions,
    };
  } catch (error) {
    console.error('[TreasurerService] Error calculating revenue optimization:', error);
    throw error;
  }
}
