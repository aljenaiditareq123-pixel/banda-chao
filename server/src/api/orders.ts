import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { calculateHubShippingForItems } from '../config/shippingRates';
import { checkTransactionRisk, blockUser, logSuspiciousTransaction } from '../services/fraudService';
import { reserveInventory, releaseInventory } from '../services/inventoryService';

const router = Router();

// Calculate shipping cost (GET /orders/shipping/calculate)
router.get('/shipping/calculate', async (req: Request, res: Response) => {
  try {
    const { country, items, originCountry } = req.query;

    if (!country || typeof country !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Country code is required',
        code: 'MISSING_COUNTRY',
      });
    }

    // Parse items if provided (for multiple products)
    let parsedItems: Array<{ weightInKg?: number; quantity: number }> = [];
    
    if (items && typeof items === 'string') {
      try {
        parsedItems = JSON.parse(items);
      } catch (e) {
        // If parsing fails, use default weight
      }
    }

    // If no items provided, use default (1 item, 1 kg)
    if (parsedItems.length === 0) {
      parsedItems = [{ weightInKg: 1, quantity: 1 }];
    }

    // Determine origin country (default to 'CN' - China)
    // Frontend can pass originCountry if products are from different origins
    const origin = (originCountry && typeof originCountry === 'string') 
      ? originCountry.toUpperCase() 
      : 'CN';

    // Calculate shipping using Hub Model or Domestic China shipping
    const shippingCalculation = calculateHubShippingForItems(
      country, 
      parsedItems,
      origin
    );

    res.json({
      success: true,
      shipping: {
        cost: shippingCalculation.total,
        details: {
          chinaToUae: shippingCalculation.chinaToUae,
          handling: shippingCalculation.handling,
          uaeToCustomer: shippingCalculation.uaeToCustomer,
          region: shippingCalculation.region,
          isDomestic: shippingCalculation.isDomestic,
          originCountry: origin,
        },
      },
    });
  } catch (error: any) {
    console.error('[Orders] Error calculating shipping:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate shipping',
      code: 'SHIPPING_CALCULATION_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

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

    // حساب تكلفة المنتجات (بدون الشحن)
    const productsTotal = total || items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // جلب معلومات المنتجات لتحديد بلد المنشأ (Origin Country)
    // Fetch product information to determine origin country
    const productIds = items.map((item: any) => item.productId).filter(Boolean);
    let originCountry = 'CN'; // Default to China (assume all products are from China artisans)
    
    if (productIds.length > 0) {
      try {
        // Fetch products with their makers to get origin country
        const products = await prisma.products.findMany({
          where: {
            id: { in: productIds },
          },
          include: {
            users: {
              include: {
                makers: {
                  select: {
                    country: true,
                  },
                },
              },
            },
          },
        });

        // Determine origin country:
        // - If all products are from China makers, use 'CN' (domestic)
        // - If mixed origins, use the first product's maker country (or default to 'CN')
        const makerCountries = products
          .map(p => {
            // makers is a one-to-one relation, so it's a single object or null
            const maker = Array.isArray(p.users?.makers) ? p.users.makers[0] : p.users?.makers;
            return maker?.country;
          })
          .filter((country): country is string => Boolean(country))
          .map((country: string) => country.toUpperCase());

        if (makerCountries.length > 0) {
          // Check if all products are from China
          const allFromChina = makerCountries.every((country: string) => 
            country === 'CHINA' || country === 'CN' || country === '中国'
          );
          
          if (allFromChina) {
            originCountry = 'CN';
          } else {
            // Use first product's maker country (or default to 'CN')
            originCountry = makerCountries[0] === 'CHINA' || makerCountries[0] === 'CN' || makerCountries[0] === '中国' 
              ? 'CN' 
              : 'CN'; // Default to CN for now (can be extended later)
          }
        }
      } catch (error) {
        console.warn('[Orders] Could not fetch product origin, defaulting to CN:', error);
        // Default to China if we can't determine origin
        originCountry = 'CN';
      }
    }

    // حساب تكلفة الشحن باستخدام استراتيجية Hub Model أو الشحن المحلي
    // Calculate shipping using Hub Model or Domestic China shipping
    // نفترض أن وزن كل منتج 1 كجم إذا لم يحدد (يمكن تحديثه لاحقاً من قاعدة البيانات)
    const shippingCalculation = calculateHubShippingForItems(
      shipping.country,
      items.map((item: any) => ({
        weightInKg: item.weightInKg || 1, // وزن افتراضي 1 كجم
        quantity: item.quantity,
      })),
      originCountry // Pass origin country to determine if domestic shipping applies
    );

    const shippingCost = shippingCalculation.total;

    // المبلغ الإجمالي = سعر المنتجات + تكلفة الشحن
    const calculatedTotal = productsTotal + shippingCost;

    console.log('[Orders] 📦 Shipping calculation:', {
      originCountry,
      destinationCountry: shipping.country,
      shippingType: shippingCalculation.isDomestic ? 'DOMESTIC_CN' : 'HUB_MODEL',
      shippingRegion: shippingCalculation.region,
      shippingDetails: {
        chinaToUae: shippingCalculation.chinaToUae,
        handling: shippingCalculation.handling,
        uaeToCustomer: shippingCalculation.uaeToCustomer,
        total: shippingCalculation.total,
        isDomestic: shippingCalculation.isDomestic,
      },
      productsTotal,
      shippingCost,
      finalTotal: calculatedTotal,
    });

    // ============================================
    // التحصينات الأمنية - Security Guards
    // ============================================

    // Declare inventoryReservations outside try block for catch block access
    const inventoryReservations: Array<{ productId: string; variantId?: string; quantity: number }> = [];

    try {
      // 1. Fraud Check - فحص الاحتيال المالي
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const fraudCheck = await checkTransactionRisk(userId, calculatedTotal, ip as string);
      
      await logSuspiciousTransaction(userId, calculatedTotal, fraudCheck.risk, ip as string);

      if (!fraudCheck.allowed) {
        console.error('[Orders] ❌ Fraud check failed:', fraudCheck.risk);
        
        if (fraudCheck.risk.shouldBlock) {
          await blockUser(userId, fraudCheck.risk.reason);
        }

        return res.status(403).json({
          success: false,
          message: 'Transaction blocked due to security risk',
          code: 'FRAUD_DETECTED',
          risk: fraudCheck.risk.riskLevel,
          requiresReview: fraudCheck.requiresReview,
        });
      }

      if (fraudCheck.requiresReview) {
        console.warn('[Orders] ⚠️ Transaction requires manual review:', fraudCheck.risk);
      }

      // 2. Atomic Inventory Reservation - حجز المخزون ذرياً
      for (const item of items) {
        const reservation = await reserveInventory(
          item.productId,
          item.quantity,
          item.variantId
        );

        if (!reservation.success) {
          // إعادة المخزون المحجوز مسبقاً
          for (const reserved of inventoryReservations) {
            await releaseInventory(reserved.productId, reserved.quantity, reserved.variantId);
          }

          return res.status(400).json({
            success: false,
            message: reservation.error || 'Insufficient stock',
            code: 'OUT_OF_STOCK',
            productId: item.productId,
          });
        }

        inventoryReservations.push({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        });
      }

      // 3. Create Order - إنشاء الطلب
      const order = await prisma.orders.create({
        data: {
          id: orderId,
          user_id: userId,
          status: 'PENDING',
          totalAmount: calculatedTotal,
          subtotal: productsTotal,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

    // حفظ تفاصيل الشحن في metadata (يمكن إضافتها كحقل منفصل لاحقاً)
    // Store shipping details in order metadata (can be added as separate field later)

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
        productsTotal,
        shippingCost,
        shippingDetails: {
          region: shippingCalculation.region,
          chinaToUae: shippingCalculation.chinaToUae,
          handling: shippingCalculation.handling,
          uaeToCustomer: shippingCalculation.uaeToCustomer,
          total: shippingCalculation.total,
          isDomestic: shippingCalculation.isDomestic,
          originCountry,
        },
        items: orderItems,
      },
    });
  } catch (error: any) {
    console.error('[Orders] ❌ Error creating order:', {
      error: error.message,
      stack: error.stack,
    });

    // إعادة المخزون المحجوز في حالة الخطأ
    if (inventoryReservations && inventoryReservations.length > 0) {
      for (const reserved of inventoryReservations) {
        await releaseInventory(reserved.productId, reserved.quantity, reserved.variantId).catch(console.error);
      }
    }

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

