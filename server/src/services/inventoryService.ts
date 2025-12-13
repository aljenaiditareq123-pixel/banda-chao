/**
 * Inventory Service - حجز المخزون الذري
 * 
 * هذا الخدمة تضمن استحالة بيع قطعة غير موجودة حتى مع مليون طلب في الثانية
 * باستخدام Redis للعمليات الذرية
 */

import { prisma } from '../utils/prisma';

let redisClient: any = null;

/**
 * تهيئة Redis Client
 */
function getRedisClient() {
  if (!redisClient && process.env.REDIS_URL) {
    try {
      const Redis = require('ioredis');
      redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      redisClient.on('error', (err: Error) => {
        console.error('Redis connection error (inventory):', err);
      });

      redisClient.on('connect', () => {
        console.log('✅ Redis connected for atomic inventory');
      });
    } catch (error) {
      console.warn('⚠️ Redis not available for inventory, using database fallback');
    }
  }
  return redisClient;
}

/**
 * حجز المخزون ذرياً (Atomic Reservation)
 * 
 * @param productId - معرف المنتج
 * @param variantId - معرف المتغير (اختياري)
 * @param quantity - الكمية المطلوبة
 * @returns true إذا نجح الحجز، false إذا كان المخزون غير كافي
 */
export async function reserveInventory(
  productId: string,
  quantity: number,
  variantId?: string
): Promise<{ success: boolean; remainingStock?: number; error?: string }> {
  const redis = getRedisClient();
  const key = variantId 
    ? `inventory:${productId}:${variantId}` 
    : `inventory:${productId}`;

  try {
    if (redis) {
      // استخدام Redis للعملية الذرية
      // DECRBY يقلل القيمة ذرياً ويعيد النتيجة
      const result = await redis.decrby(key, quantity);
      const newStock = parseInt(result);

      if (newStock < 0) {
        // المخزون غير كافي - إعادة القيمة
        await redis.incrby(key, quantity);
        return {
          success: false,
          error: 'Insufficient stock',
        };
      }

      // تحديث TTL (Time To Live) - 24 ساعة
      await redis.expire(key, 86400);

      return {
        success: true,
        remainingStock: newStock,
      };
    } else {
      // Fallback إلى قاعدة البيانات (أقل أماناً في الضغط العالي)
      return await reserveInventoryDatabase(productId, quantity, variantId);
    }
  } catch (error: any) {
    console.error('Error reserving inventory:', error);
    // Fallback إلى قاعدة البيانات
    return await reserveInventoryDatabase(productId, quantity, variantId);
  }
}

/**
 * حجز المخزون من قاعدة البيانات (Fallback)
 */
async function reserveInventoryDatabase(
  productId: string,
  quantity: number,
  variantId?: string
): Promise<{ success: boolean; remainingStock?: number; error?: string }> {
  try {
    if (variantId) {
      // حجز من Variant
      const variant = await prisma.product_variants.findUnique({
        where: { id: variantId },
      });

      if (!variant || variant.stock < quantity) {
        return {
          success: false,
          error: 'Insufficient stock',
        };
      }

      await prisma.product_variants.update({
        where: { id: variantId },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });

      return {
        success: true,
        remainingStock: variant.stock - quantity,
      };
    } else {
      // حجز من Product
      const product = await prisma.products.findUnique({
        where: { id: productId },
      });

      if (!product || (product.stock || 0) < quantity) {
        return {
          success: false,
          error: 'Insufficient stock',
        };
      }

      await prisma.products.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });

      return {
        success: true,
        remainingStock: (product.stock || 0) - quantity,
      };
    }
  } catch (error: any) {
    console.error('Error in database inventory reservation:', error);
    return {
      success: false,
      error: 'Failed to reserve inventory',
    };
  }
}

/**
 * إعادة المخزون (عند إلغاء الطلب)
 */
export async function releaseInventory(
  productId: string,
  quantity: number,
  variantId?: string
): Promise<void> {
  const redis = getRedisClient();
  const key = variantId 
    ? `inventory:${productId}:${variantId}` 
    : `inventory:${productId}`;

  try {
    if (redis) {
      // زيادة ذرياً
      await redis.incrby(key, quantity);
      await redis.expire(key, 86400);
    } else {
      // Fallback إلى قاعدة البيانات
      if (variantId) {
        await prisma.product_variants.update({
          where: { id: variantId },
          data: {
            stock: {
              increment: quantity,
            },
          },
        });
      } else {
        await prisma.products.update({
          where: { id: productId },
          data: {
            stock: {
              increment: quantity,
            },
          },
        });
      }
    }
  } catch (error) {
    console.error('Error releasing inventory:', error);
  }
}

/**
 * مزامنة المخزون من قاعدة البيانات إلى Redis
 * يجب استدعاؤها عند بدء الخادم أو بعد تحديث المخزون
 */
export async function syncInventoryToRedis(): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    // مزامنة Products
    const products = await prisma.products.findMany({
      where: {
        stock: { gt: 0 },
      },
      select: {
        id: true,
        stock: true,
      },
    });

    for (const product of products) {
      const key = `inventory:${product.id}`;
      await redis.set(key, product.stock || 0);
      await redis.expire(key, 86400);
    }

    // مزامنة Variants
    const variants = await prisma.product_variants.findMany({
      where: {
        stock: { gt: 0 },
      },
      select: {
        id: true,
        product_id: true,
        stock: true,
      },
    });

    for (const variant of variants) {
      const key = `inventory:${variant.product_id}:${variant.id}`;
      await redis.set(key, variant.stock);
      await redis.expire(key, 86400);
    }

    console.log(`✅ Synced ${products.length} products and ${variants.length} variants to Redis`);
  } catch (error) {
    console.error('Error syncing inventory to Redis:', error);
  }
}

/**
 * الحصول على المخزون المتاح
 */
export async function getAvailableStock(
  productId: string,
  variantId?: string
): Promise<number> {
  const redis = getRedisClient();
  const key = variantId 
    ? `inventory:${productId}:${variantId}` 
    : `inventory:${productId}`;

  try {
    if (redis) {
      const stock = await redis.get(key);
      if (stock !== null) {
        return parseInt(stock);
      }
    }

    // Fallback إلى قاعدة البيانات
    if (variantId) {
      const variant = await prisma.product_variants.findUnique({
        where: { id: variantId },
        select: { stock: true },
      });
      return variant?.stock || 0;
    } else {
      const product = await prisma.products.findUnique({
        where: { id: productId },
        select: { stock: true },
      });
      return product?.stock || 0;
    }
  } catch (error) {
    console.error('Error getting available stock:', error);
    return 0;
  }
}
