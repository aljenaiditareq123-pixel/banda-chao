# مهمة لاحقة: توظيف "المحلل النفسي للمستخدم" (UX Analyst)
## Future Task: Add UX Psychologist AI Staff Member

**الحالة:** جاهز للتنفيذ بعد استقرار الإطلاق  
**الأولوية:** متوسطة-عالية (بعد الأسبوع الأول من Beta)  
**التقدير:** 2-3 ساعات عمل

---

## 🎯 الهدف

إضافة نظام تحليل سلوك متقدم في الـ Backend لـ Banda Chao، يركز على رصد "نقاط التسرب" في رحلة المستخدم (مثل صفحة السلة والدفع).

**الفائدة:**
- تحديد نقاط التسرب في رحلة المستخدم
- تحسين معدل إتمام الشراء
- تقليل Cart Abandonment
- تحسين تجربة المستخدم بناءً على البيانات

---

## 📋 الخطوات التفصيلية

### 1. إنشاء جدول تتبع السلوك (Behavior Tracking Table)

**الموقع:** `server/prisma/schema.prisma`

**المطلوب:**
إضافة نموذج `UserBehavior` لتسجيل النقاط الحرجة في رحلة المستخدم.

**الكود المطلوب:**
```prisma
model UserBehavior {
  id            String   @id @default(uuid())
  user_id       Int?
  user          Users?   @relation(fields: [user_id], references: [id], onDelete: SetNull)
  event_type    String   // CART_VIEW, CHECKOUT_START, CHECKOUT_FAIL, CART_ABANDON, PRODUCT_VIEW, etc.
  event_data    Json?    // لتسجيل محتوى السلة عند التسرب، تفاصيل المنتج، إلخ
  page_url      String?
  referrer      String?
  user_agent    String?
  ip_address    String?
  created_at    DateTime @default(now())
  
  @@index([user_id])
  @@index([event_type])
  @@index([created_at])
}
```

**الخطوات:**
1. فتح `server/prisma/schema.prisma`
2. إضافة نموذج `UserBehavior` أعلاه
3. تشغيل `npx prisma migrate dev --name add_user_behavior_tracking`
4. تشغيل `npx prisma generate`

---

### 2. تحديث Backend API لتسجيل السلوك

**الموقع:** `server/src/api/cart.ts` و `server/src/api/checkout.ts`

**المطلوب:**
إضافة وظيفة `recordBehavior(event_type, user_id, event_data)` لتسجيل الأحداث في قاعدة البيانات.

**الكود المطلوب:**

#### أ) إنشاء ملف مساعد: `server/src/utils/behaviorTracking.ts`

```typescript
import { prisma } from './prisma';

export interface BehaviorEventData {
  cartItems?: Array<{ productId: string; quantity: number; price: number }>;
  cartTotal?: number;
  productId?: string;
  productName?: string;
  errorMessage?: string;
  [key: string]: any;
}

export async function recordBehavior(
  eventType: string,
  userId: number | null,
  eventData?: BehaviorEventData,
  metadata?: {
    pageUrl?: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
  }
): Promise<void> {
  try {
    await prisma.userBehavior.create({
      data: {
        user_id: userId,
        event_type: eventType,
        event_data: eventData || {},
        page_url: metadata?.pageUrl,
        referrer: metadata?.referrer,
        user_agent: metadata?.userAgent,
        ip_address: metadata?.ipAddress,
      },
    });
  } catch (error) {
    // Log error but don't throw - behavior tracking should not break the app
    console.error('[BehaviorTracking] Failed to record behavior:', error);
  }
}

// Event type constants
export const BEHAVIOR_EVENTS = {
  CART_VIEW: 'CART_VIEW',
  CART_ABANDON: 'CART_ABANDON',
  CHECKOUT_START: 'CHECKOUT_START',
  CHECKOUT_FAIL: 'CHECKOUT_FAIL',
  CHECKOUT_SUCCESS: 'CHECKOUT_SUCCESS',
  PRODUCT_VIEW: 'PRODUCT_VIEW',
  PRODUCT_ADD_TO_CART: 'PRODUCT_ADD_TO_CART',
  PRODUCT_REMOVE_FROM_CART: 'PRODUCT_REMOVE_FROM_CART',
} as const;
```

#### ب) تحديث `server/src/api/cart.ts`

```typescript
import { recordBehavior, BEHAVIOR_EVENTS } from '../utils/behaviorTracking';

// في endpoint GET /cart
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    // ... existing cart logic ...
    
    // تسجيل حدث فتح السلة
    await recordBehavior(
      BEHAVIOR_EVENTS.CART_VIEW,
      userId || null,
      {
        cartItems: cartItems.map(item => ({
          productId: item.product.id.toString(),
          quantity: item.quantity,
          price: item.product.price,
        })),
        cartTotal: getCartTotal(),
      },
      {
        pageUrl: req.headers.referer || '/cart',
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      }
    );
    
    // ... rest of response ...
  } catch (error) {
    // ... error handling ...
  }
});
```

#### ج) تحديث `server/src/api/checkout.ts`

```typescript
import { recordBehavior, BEHAVIOR_EVENTS } from '../utils/behaviorTracking';

// في endpoint POST /checkout (بدء الدفع)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { items, shipping, payment, total } = req.body;
    
    // تسجيل حدث بدء الدفع
    await recordBehavior(
      BEHAVIOR_EVENTS.CHECKOUT_START,
      userId || null,
      {
        cartItems: items,
        cartTotal: total,
      },
      {
        pageUrl: req.headers.referer || '/checkout',
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      }
    );
    
    // ... existing checkout logic ...
    
    // في حالة النجاح
    await recordBehavior(
      BEHAVIOR_EVENTS.CHECKOUT_SUCCESS,
      userId || null,
      {
        orderId: order.id.toString(),
        cartTotal: total,
      }
    );
    
    // ... rest of response ...
  } catch (error) {
    // تسجيل حدث فشل الدفع
    await recordBehavior(
      BEHAVIOR_EVENTS.CHECKOUT_FAIL,
      req.user?.id || null,
      {
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        cartTotal: req.body.total,
      }
    );
    
    // ... error handling ...
  }
});
```

#### د) إضافة endpoint لتسجيل Cart Abandonment

```typescript
// في server/src/api/cart.ts
router.post('/abandon', async (req: Request, res: Response) => {
  try {
    const { userId, cartItems, cartTotal } = req.body;
    
    await recordBehavior(
      BEHAVIOR_EVENTS.CART_ABANDON,
      userId || null,
      {
        cartItems: cartItems || [],
        cartTotal: cartTotal || 0,
      },
      {
        pageUrl: req.headers.referer,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to record cart abandonment:', error);
    res.status(500).json({ success: false, error: 'Failed to record abandonment' });
  }
});
```

---

### 3. إضافة Frontend Tracking

**الموقع:** `app/[locale]/cart/page-client.tsx` و `app/[locale]/checkout/page-client.tsx`

**المطلوب:**
إضافة استدعاءات API لتسجيل الأحداث من الواجهة الأمامية.

#### أ) تحديث `app/[locale]/cart/page-client.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { apiClient } from '@/lib/api';

export default function CartPageClient() {
  const { user } = useAuth();
  const { cart, getCartTotal } = useCart();
  
  // تسجيل حدث فتح السلة
  useEffect(() => {
    const recordCartView = async () => {
      try {
        await apiClient.post('/cart/track-view', {
          userId: user?.id || null,
          cartItems: cart.map(item => ({
            productId: item.product.id.toString(),
            quantity: item.quantity,
            price: item.product.price,
          })),
          cartTotal: getCartTotal(),
        });
      } catch (error) {
        // Silent fail - tracking should not break UX
        console.warn('Failed to track cart view:', error);
      }
    };
    
    recordCartView();
  }, []); // Run once on mount
  
  // تسجيل حدث مغادرة السلة (Cart Abandonment)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (cart.length > 0) {
        // Send abandonment event
        navigator.sendBeacon('/api/v1/cart/abandon', JSON.stringify({
          userId: user?.id || null,
          cartItems: cart.map(item => ({
            productId: item.product.id.toString(),
            quantity: item.quantity,
            price: item.product.price,
          })),
          cartTotal: getCartTotal(),
        }));
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [cart, user, getCartTotal]);
  
  // ... rest of component ...
}
```

#### ب) تحديث `app/[locale]/checkout/page-client.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { apiClient } from '@/lib/api';

export default function CheckoutPageClient() {
  const { user } = useAuth();
  const { cart, getCartTotal } = useCart();
  
  // تسجيل حدث بدء الدفع
  useEffect(() => {
    const recordCheckoutStart = async () => {
      try {
        await apiClient.post('/checkout/track-start', {
          userId: user?.id || null,
          cartItems: cart.map(item => ({
            productId: item.product.id.toString(),
            quantity: item.quantity,
            price: item.product.price,
          })),
          cartTotal: getCartTotal(),
        });
      } catch (error) {
        console.warn('Failed to track checkout start:', error);
      }
    };
    
    recordCheckoutStart();
  }, []); // Run once on mount
  
  // ... rest of component ...
}
```

---

### 4. إضافة تقرير جديد إلى Founder Dashboard

**الموقع:** `server/src/api/founder.ts` (Backend) و `components/founder/FounderDashboard.tsx` (Frontend)

#### أ) تحديث Backend API

```typescript
// في server/src/api/founder.ts

// إضافة KPI جديد: معدل التسرب من السلة
router.get('/kpis', authenticateToken, requireRole(['FOUNDER']), async (req: AuthRequest, res: Response) => {
  try {
    // ... existing KPIs ...
    
    // حساب معدل التسرب من السلة
    const [cartViews, cartAbandons] = await Promise.all([
      prisma.userBehavior.count({
        where: { event_type: 'CART_VIEW' },
      }),
      prisma.userBehavior.count({
        where: { event_type: 'CART_ABANDON' },
      }),
    ]);
    
    const cartAbandonmentRate = cartViews > 0
      ? (cartAbandons / cartViews) * 100
      : 0;
    
    // حساب معدل إتمام الشراء
    const [checkoutStarts, checkoutSuccesses] = await Promise.all([
      prisma.userBehavior.count({
        where: { event_type: 'CHECKOUT_START' },
      }),
      prisma.userBehavior.count({
        where: { event_type: 'CHECKOUT_SUCCESS' },
      }),
    ]);
    
    const checkoutConversionRate = checkoutStarts > 0
      ? (checkoutSuccesses / checkoutStarts) * 100
      : 0;
    
    const kpis = {
      // ... existing KPIs ...
      cartAbandonmentRate: Math.round(cartAbandonmentRate * 100) / 100, // Round to 2 decimals
      checkoutConversionRate: Math.round(checkoutConversionRate * 100) / 100,
      totalCartViews: cartViews,
      totalCartAbandons: cartAbandons,
      totalCheckoutStarts: checkoutStarts,
      totalCheckoutSuccesses: checkoutSuccesses,
    };
    
    res.json(kpis);
  } catch (error) {
    // ... error handling ...
  }
});
```

#### ب) تحديث TypeScript Types

```typescript
// في types/founder.ts

export interface FounderKPIs {
  // ... existing KPIs ...
  /** معدل التسرب من السلة - Cart Abandonment Rate (%) */
  cartAbandonmentRate: number;
  /** معدل إتمام الشراء - Checkout Conversion Rate (%) */
  checkoutConversionRate: number;
  /** إجمالي مشاهدات السلة - Total Cart Views */
  totalCartViews: number;
  /** إجمالي تسربات السلة - Total Cart Abandons */
  totalCartAbandons: number;
  /** إجمالي بدايات الدفع - Total Checkout Starts */
  totalCheckoutStarts: number;
  /** إجمالي عمليات الدفع الناجحة - Total Checkout Successes */
  totalCheckoutSuccesses: number;
}
```

#### ج) تحديث Frontend Dashboard

```typescript
// في components/founder/FounderDashboard.tsx

// إضافة بطاقات جديدة لعرض معدل التسرب ومعدل التحويل
<Card className={`${kpis?.cartAbandonmentRate > 50 ? 'bg-red-50 border-red-200' : kpis?.cartAbandonmentRate > 30 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
  <div className="p-6">
    <p className="text-sm font-medium text-gray-700 mb-2">
      معدل التسرب من السلة
    </p>
    <p className="text-3xl font-bold text-gray-900">
      {kpis?.cartAbandonmentRate?.toFixed(1) || 0}%
    </p>
    <p className="text-xs text-gray-600 mt-1">
      {kpis?.totalCartAbandons || 0} من {kpis?.totalCartViews || 0} سلة
    </p>
    {kpis?.cartAbandonmentRate > 50 && (
      <p className="text-xs text-red-600 mt-2 font-semibold">
        ⚠️ معدل عالي - يحتاج تحسين
      </p>
    )}
  </div>
</Card>

<Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
  <div className="p-6">
    <p className="text-sm font-medium text-green-700 mb-2">
      معدل إتمام الشراء
    </p>
    <p className="text-3xl font-bold text-green-900">
      {kpis?.checkoutConversionRate?.toFixed(1) || 0}%
    </p>
    <p className="text-xs text-green-600 mt-1">
      {kpis?.totalCheckoutSuccesses || 0} من {kpis?.totalCheckoutStarts || 0} عملية دفع
    </p>
  </div>
</Card>
```

---

### 5. إضافة API Endpoint للتحليل التفصيلي

**الموقع:** `server/src/api/founder.ts`

```typescript
// تحليل تفصيلي لسلوك المستخدمين
router.get('/behavior-analysis', authenticateToken, requireRole(['FOUNDER']), async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where: any = {};
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = new Date(startDate as string);
      if (endDate) where.created_at.lte = new Date(endDate as string);
    }
    
    // تحليل الأحداث حسب النوع
    const eventsByType = await prisma.userBehavior.groupBy({
      by: ['event_type'],
      where,
      _count: {
        id: true,
      },
    });
    
    // تحليل التسرب حسب المنتج
    const abandonmentsByProduct = await prisma.userBehavior.findMany({
      where: {
        ...where,
        event_type: 'CART_ABANDON',
      },
      select: {
        event_data: true,
      },
    });
    
    // تحليل نقاط الفشل
    const failures = await prisma.userBehavior.findMany({
      where: {
        ...where,
        event_type: 'CHECKOUT_FAIL',
      },
      select: {
        event_data: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 10,
    });
    
    res.json({
      success: true,
      eventsByType,
      abandonmentsByProduct: abandonmentsByProduct.slice(0, 20), // Top 20
      recentFailures: failures,
    });
  } catch (error) {
    console.error('Behavior analysis error:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze behavior' });
  }
});
```

---

## ✅ قائمة التحقق (Checklist)

### Backend
- [ ] إضافة نموذج `UserBehavior` في Prisma Schema
- [ ] تشغيل Migration
- [ ] إنشاء `server/src/utils/behaviorTracking.ts`
- [ ] تحديث `server/src/api/cart.ts` لتسجيل الأحداث
- [ ] تحديث `server/src/api/checkout.ts` لتسجيل الأحداث
- [ ] إضافة endpoint `/cart/abandon` لتسجيل Cart Abandonment
- [ ] تحديث `server/src/api/founder.ts` لإضافة KPIs الجديدة
- [ ] إضافة endpoint `/founder/behavior-analysis` للتحليل التفصيلي
- [ ] تحديث `types/founder.ts` لإضافة الأنواع الجديدة

### Frontend
- [ ] تحديث `app/[locale]/cart/page-client.tsx` لتسجيل الأحداث
- [ ] تحديث `app/[locale]/checkout/page-client.tsx` لتسجيل الأحداث
- [ ] تحديث `components/founder/FounderDashboard.tsx` لعرض KPIs الجديدة
- [ ] إضافة API methods في `lib/api.ts` إذا لزم الأمر

### Testing & Validation
- [ ] اختبار تسجيل `CART_VIEW`
- [ ] اختبار تسجيل `CART_ABANDON`
- [ ] اختبار تسجيل `CHECKOUT_START`
- [ ] اختبار تسجيل `CHECKOUT_SUCCESS`
- [ ] اختبار تسجيل `CHECKOUT_FAIL`
- [ ] التحقق من حساب معدل التسرب بشكل صحيح
- [ ] التحقق من حساب معدل التحويل بشكل صحيح
- [ ] التحقق من عرض KPIs في Dashboard

### Final Steps
- [ ] تشغيل `npm run type-check` (Frontend)
- [ ] تشغيل `npm run build` (Frontend)
- [ ] تشغيل `npm run build` (Backend)
- [ ] Git commit: `git add . && git commit -m "Add UX Psychologist: Behavior tracking and cart abandonment analysis"`
- [ ] Git push: `git push origin main`

---

## 📊 المؤشرات المتوقعة

بعد التنفيذ، ستكون قادراً على:

1. **معدل التسرب من السلة (Cart Abandonment Rate):**
   - الهدف: < 30%
   - تحذير: > 50% (يحتاج تحسين فوري)

2. **معدل إتمام الشراء (Checkout Conversion Rate):**
   - الهدف: > 70%
   - جيد: 50-70%
   - يحتاج تحسين: < 50%

3. **تحليل تفصيلي:**
   - المنتجات الأكثر تسرباً
   - نقاط الفشل في عملية الدفع
   - أنماط السلوك حسب الوقت

---

## 🎯 الفوائد المتوقعة

1. **تحسين معدل التحويل:**
   - تحديد نقاط التسرب بدقة
   - تحسين تجربة المستخدم بناءً على البيانات

2. **اتخاذ قرارات مدروسة:**
   - معرفة المنتجات التي تحتاج تحسين
   - معرفة نقاط الفشل في عملية الدفع

3. **تحسين ROI:**
   - تقليل Cart Abandonment
   - زيادة معدل إتمام الشراء

---

## 📝 ملاحظات مهمة

1. **الخصوصية:**
   - لا تسجل معلومات حساسة (مثل أرقام البطاقات)
   - احترم قوانين GDPR/CCPA

2. **الأداء:**
   - استخدم `navigator.sendBeacon` للـ Cart Abandonment (لا ينتظر استجابة)
   - لا ترمي أخطاء من Behavior Tracking (يجب أن يكون silent)

3. **التوسع:**
   - يمكن إضافة المزيد من الأحداث لاحقاً (PRODUCT_VIEW, SEARCH, etc.)
   - يمكن إضافة تحليل متقدم باستخدام AI لاحقاً

---

**تاريخ الإنشاء:** ديسمبر 2025  
**الحالة:** جاهز للتنفيذ بعد استقرار الإطلاق  
**الأولوية:** متوسطة-عالية

