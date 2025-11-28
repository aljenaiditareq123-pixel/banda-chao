# دليل ربط Stripe والامتثال المالي - Banda Chao
## Stripe Integration & Financial Compliance Guide

**المشروع:** Banda Chao  
**المنطقة:** Ras Al Khaimah Economic Zone (RAKEZ), UAE  
**التاريخ:** $(date)  
**الإصدار:** 1.0

---

## 📋 جدول المحتويات

1. [قائمة الربط - 5 خطوات لربط Stripe](#1-قائمة-الربط)
2. [إجراءات VAT في الإمارات](#2-إجراءات-vat-في-الإمارات)
3. [إعدادات البيئة (Environment Variables)](#3-إعدادات-البيئة)
4. [اختبار الربط](#4-اختبار-الربط)
5. [أفضل الممارسات والأمان](#5-أفضل-الممارسات-والأمان)
6. [استكشاف الأخطاء](#6-استكشاف-الأخطاء)

---

## 1. قائمة الربط - 5 خطوات لربط Stripe

### ✅ الخطوة 1: إنشاء حساب Stripe للشركة

#### 1.1 التسجيل في Stripe
- **الموقع:** https://dashboard.stripe.com/register
- **اختر:** "Create account" → "Business account"
- **المعلومات المطلوبة:**
  - اسم الشركة: **Banda Chao LLC**
  - نوع النشاط: **E-commerce / Marketplace**
  - البلد: **United Arab Emirates**
  - المنطقة: **Ras Al Khaimah**
  - رقم الرخصة: **[رقم الرخصة من RAKEZ]**
  - العنوان القانوني: **[عنوان المكتب المسجل في RAKEZ]**

#### 1.2 إكمال معلومات الشركة
- ✅ **معلومات الاتصال:**
  - البريد الإلكتروني الرسمي: `info@bandachao.com` (أو البريد المخصص)
  - رقم الهاتف: [+971 XX XXX XXXX]
  
- ✅ **معلومات البنك:**
  - اسم البنك: [اسم البنك]
  - رقم الحساب: [رقم الحساب]
  - IBAN: [IBAN]
  - SWIFT/BIC: [SWIFT Code]
  
- ✅ **معلومات الضرائب:**
  - رقم TRN (Tax Registration Number): [رقم VAT من FTA]
  - نوع الكيان: **Free Zone Company**

#### 1.3 التحقق من الحساب
- Stripe سيرسل رسالة تحقق للبريد الإلكتروني
- قد يطلبون مستندات إضافية:
  - شهادة التأسيس من RAKEZ
  - عقد التأسيس
  - إثبات العنوان
  - كشف حساب بنكي

**⏱️ المدة المتوقعة:** 1-3 أيام عمل

---

### ✅ الخطوة 2: الحصول على API Keys

#### 2.1 الوصول إلى API Keys
1. سجل الدخول إلى [Stripe Dashboard](https://dashboard.stripe.com)
2. اذهب إلى: **Developers** → **API keys**
3. ستجد مفتاحين:
   - **Publishable key** (يبدأ بـ `pk_test_` أو `pk_live_`)
   - **Secret key** (يبدأ بـ `sk_test_` أو `sk_live_`)

#### 2.2 مفاتيح الاختبار (Test Mode)
- **Publishable key:** `pk_test_...`
- **Secret key:** `sk_test_...`
- **الاستخدام:** للتطوير والاختبار فقط
- **بطاقات الاختبار:** استخدم [بطاقات اختبار Stripe](https://stripe.com/docs/testing)

#### 2.3 مفاتيح الإنتاج (Live Mode)
- **تفعيل Live Mode:**
  1. اذهب إلى **Developers** → **API keys**
  2. اضغط على **"Activate test mode"** لتحويله إلى **Live mode**
  3. **تحذير:** تأكد من إكمال التحقق من الحساب أولاً

- **Publishable key:** `pk_live_...`
- **Secret key:** `sk_live_...`
- **الاستخدام:** للإنتاج فقط

**🔒 الأمان:** **لا تشارك Secret key أبداً** في الكود العام أو GitHub

---

### ✅ الخطوة 3: إضافة Environment Variables

#### 3.1 إعداد ملف `.env` في الخادم (Backend)

افتح ملف `.env` في مجلد `server/` وأضف:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx  # استبدل بالمفتاح الفعلي
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx  # للاستخدام في Frontend (اختياري)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx  # سيتم الحصول عليه في الخطوة 4
STRIPE_MODE=test  # أو 'live' للإنتاج
```

#### 3.2 إعداد Environment Variables في Render (Production)

1. اذهب إلى [Render Dashboard](https://dashboard.render.com)
2. اختر خدمة Backend (banda-chao-backend)
3. اذهب إلى **Environment** → **Environment Variables**
4. أضف المتغيرات التالية:

```
STRIPE_SECRET_KEY = sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET = whsec_xxxxxxxxxxxxxxxxxxxxx
STRIPE_MODE = live
```

**🔒 الأمان:** 
- ✅ استخدم **Secret keys** فقط في Backend
- ✅ لا تضع **Secret keys** في Frontend أبداً
- ✅ استخدم **Publishable keys** في Frontend فقط

#### 3.3 التحقق من الإعداد

افتح `server/src/lib/stripe.ts` وتأكد من:

```typescript
// ✅ يجب أن يكون الكود موجوداً
if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV !== 'test') {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_testing', {
  apiVersion: '2023-10-16',
});
```

---

### ✅ الخطوة 4: إعداد Webhook Endpoint

#### 4.1 ما هو Webhook؟
Webhook هو رابط يرسل Stripe إليه إشعارات عند حدوث أحداث (مثل: دفع ناجح، فشل دفع، إلخ).

#### 4.2 إنشاء Webhook في Stripe Dashboard

1. اذهب إلى: **Developers** → **Webhooks**
2. اضغط على **"Add endpoint"**
3. أدخل:
   - **Endpoint URL:** `https://your-backend-url.onrender.com/api/v1/payments/webhook`
     - استبدل `your-backend-url` بعنوان Backend الفعلي على Render
   - **Description:** "Banda Chao Payment Webhook"
   - **Events to listen to:** اختر:
     - ✅ `checkout.session.completed`
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`

4. اضغط **"Add endpoint"**
5. **انسخ Webhook Secret:** سيظهر `whsec_xxxxxxxxxxxxxxxxxxxxx`
   - أضفه إلى `.env` كـ `STRIPE_WEBHOOK_SECRET`

#### 4.3 التحقق من Webhook في الكود

افتح `server/src/api/payments.ts` وتأكد من وجود:

```typescript
// ✅ يجب أن يكون موجوداً
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('STRIPE_WEBHOOK_SECRET is not set. Webhook verification skipped.');
    return res.status(400).json({ error: 'Webhook secret not configured' });
  }

  try {
    const event = verifyWebhookSignature(req.body, sig, webhookSecret);
    // ... معالجة الأحداث
  } catch (error) {
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }
});
```

#### 4.4 اختبار Webhook محلياً (اختياري)

لاختبار Webhook على جهازك المحلي، استخدم [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
# تثبيت Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# أو
# اتبع التعليمات من https://stripe.com/docs/stripe-cli

# تسجيل الدخول
stripe login

# إعادة توجيه Webhook إلى localhost
stripe listen --forward-to localhost:5000/api/v1/payments/webhook
```

---

### ✅ الخطوة 5: اختبار الربط الكامل

#### 5.1 اختبار في Test Mode

1. **تشغيل الخادم:**
   ```bash
   cd server
   npm run dev
   ```

2. **إنشاء طلب اختبار:**
   - استخدم بطاقة اختبار: `4242 4242 4242 4242`
   - تاريخ انتهاء: أي تاريخ مستقبلي (مثل: 12/25)
   - CVV: أي 3 أرقام (مثل: 123)
   - ZIP: أي 5 أرقام (مثل: 12345)

3. **التحقق من Dashboard:**
   - اذهب إلى **Stripe Dashboard** → **Payments**
   - يجب أن ترى الدفعة الاختبارية

#### 5.2 التحقق من Webhook

1. بعد إتمام دفع اختباري، اذهب إلى:
   - **Stripe Dashboard** → **Developers** → **Webhooks**
   - اختر Webhook endpoint
   - اضغط على **"Send test webhook"**
   - اختر حدث: `checkout.session.completed`

2. **التحقق في Logs:**
   - تحقق من logs الخادم للتأكد من استلام Webhook
   - تحقق من قاعدة البيانات للتأكد من تحديث حالة الطلب

#### 5.3 التحول إلى Live Mode

**⚠️ تحذير:** لا تتحول إلى Live Mode إلا بعد:
- ✅ إكمال التحقق من الحساب في Stripe
- ✅ اختبار جميع الوظائف في Test Mode
- ✅ التأكد من صحة Webhook endpoint
- ✅ التأكد من إعدادات VAT (انظر القسم 2)

**خطوات التحول:**
1. استبدل `STRIPE_SECRET_KEY` في `.env` من `sk_test_` إلى `sk_live_`
2. استبدل `STRIPE_WEBHOOK_SECRET` بـ Webhook secret من Live Mode
3. غيّر `STRIPE_MODE=live` في `.env`
4. أعد تشغيل الخادم

---

## 2. إجراءات VAT في الإمارات

### 📊 نظرة عامة على VAT في الإمارات

**ضريبة القيمة المضافة (VAT)** في دولة الإمارات العربية المتحدة:
- **النسبة:** 5%
- **السلطة المختصة:** Federal Tax Authority (FTA)
- **الموقع:** https://www.tax.gov.ae

### ✅ متى يجب التسجيل في VAT؟

#### 2.1 حد التسجيل الإلزامي (Mandatory Registration Threshold)
- **الإيرادات السنوية:** 375,000 AED (حوالي $102,000)
- **إذا تجاوزت إيراداتك هذا الحد:** التسجيل إلزامي
- **إذا كانت إيراداتك بين 187,500 - 375,000 AED:** التسجيل اختياري لكن موصى به

#### 2.2 متى يجب التسجيل؟
- **خلال 30 يوم** من تجاوز حد التسجيل الإلزامي
- **قبل البدء بالعمليات** إذا كنت تتوقع تجاوز الحد خلال 12 شهراً

### 📝 خطوات التسجيل في VAT

#### الخطوة 1: التسجيل في FTA Portal
1. اذهب إلى: https://eservices.tax.gov.ae
2. اضغط على **"Register"**
3. اختر **"Tax Registration"** → **"VAT Registration"**
4. أدخل معلومات الشركة:
   - اسم الشركة: **Banda Chao LLC**
   - رقم الرخصة: [من RAKEZ]
   - رقم TRN: [إذا كان متوفراً]
   - العنوان: [عنوان RAKEZ]

#### الخطوة 2: تقديم المستندات
- ✅ شهادة التأسيس من RAKEZ
- ✅ عقد التأسيس
- ✅ كشف حساب بنكي (آخر 3 أشهر)
- ✅ تقرير مالي (إذا كان متوفراً)
- ✅ معلومات عن النشاط التجاري

#### الخطوة 3: الحصول على رقم TRN
- بعد الموافقة، ستحصل على **Tax Registration Number (TRN)**
- مثال: `TRN-100123456789`
- **احفظ هذا الرقم** - ستحتاجه في كل فاتورة

**⏱️ المدة المتوقعة:** 5-10 أيام عمل

### 💰 كيفية التعامل مع VAT في المدفوعات

#### 2.3 إضافة VAT إلى الأسعار

**الخيار 1: الأسعار شاملة VAT (Recommended)**
```typescript
// مثال: منتج بسعر 100 AED
const productPrice = 100; // السعر شامل VAT
const vatAmount = productPrice * (5 / 105); // ≈ 4.76 AED
const priceExcludingVat = productPrice - vatAmount; // ≈ 95.24 AED

// في Stripe Checkout
const lineItems = [{
  price_data: {
    currency: 'aed',
    product_data: {
      name: productName,
    },
    unit_amount: Math.round(productPrice * 100), // 10000 (cents)
  },
  quantity: 1,
}];
```

**الخيار 2: الأسعار غير شاملة VAT**
```typescript
// مثال: منتج بسعر 100 AED (غير شامل VAT)
const priceExcludingVat = 100;
const vatAmount = priceExcludingVat * 0.05; // 5 AED
const totalPrice = priceExcludingVat + vatAmount; // 105 AED

// في Stripe Checkout - أضف VAT كـ line item منفصل
const lineItems = [
  {
    price_data: {
      currency: 'aed',
      product_data: {
        name: productName,
      },
      unit_amount: Math.round(priceExcludingVat * 100),
    },
    quantity: 1,
  },
  {
    price_data: {
      currency: 'aed',
      product_data: {
        name: 'VAT (5%)',
      },
      unit_amount: Math.round(vatAmount * 100),
    },
    quantity: 1,
  },
];
```

#### 2.4 تحديث كود Stripe Checkout

افتح `server/src/lib/stripe.ts` وأضف دالة لحساب VAT:

```typescript
/**
 * Calculate VAT amount for UAE (5%)
 */
export function calculateVAT(amountExcludingVAT: number, includeVAT: boolean = false): {
  amountExcludingVAT: number;
  vatAmount: number;
  totalAmount: number;
} {
  if (includeVAT) {
    // Price includes VAT - extract VAT
    const vatAmount = amountExcludingVAT * (5 / 105);
    const priceExcludingVAT = amountExcludingVAT - vatAmount;
    return {
      amountExcludingVAT: Math.round(priceExcludingVAT * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100,
      totalAmount: amountExcludingVAT,
    };
  } else {
    // Price excludes VAT - add VAT
    const vatAmount = amountExcludingVAT * 0.05;
    const totalAmount = amountExcludingVAT + vatAmount;
    return {
      amountExcludingVAT,
      vatAmount: Math.round(vatAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }
}

/**
 * Create checkout session with VAT
 */
export async function createCheckoutSessionWithVAT(params: {
  orderId: string;
  productName: string;
  amount: number; // Amount excluding VAT
  currency: string;
  quantity: number;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  includeVAT?: boolean; // Whether price includes VAT
}): Promise<Stripe.Checkout.Session> {
  const { amount, includeVAT = false, ...otherParams } = params;
  
  const vatCalculation = calculateVAT(amount, includeVAT);
  
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price_data: {
        currency: params.currency.toLowerCase(),
        product_data: {
          name: params.productName,
        },
        unit_amount: Math.round(vatCalculation.amountExcludingVAT * 100),
      },
      quantity: params.quantity,
    },
  ];

  // Add VAT as separate line item if price excludes VAT
  if (!includeVAT && vatCalculation.vatAmount > 0) {
    lineItems.push({
      price_data: {
        currency: params.currency.toLowerCase(),
        product_data: {
          name: 'VAT (5%)',
          description: 'UAE Value Added Tax',
        },
        unit_amount: Math.round(vatCalculation.vatAmount * 100),
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItems,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      orderId: params.orderId,
      vatAmount: vatCalculation.vatAmount.toString(),
      amountExcludingVAT: vatCalculation.amountExcludingVAT.toString(),
    },
    customer_email: params.customerEmail,
  });

  return session;
}
```

#### 2.5 إضافة TRN إلى الفواتير

عند إنشاء فاتورة في Stripe، أضف TRN في metadata:

```typescript
const session = await stripe.checkout.sessions.create({
  // ... other params
  metadata: {
    orderId: orderId,
    trn: process.env.VAT_TRN || 'TRN-XXXXXXXXXX', // أضف هذا إلى .env
    vatAmount: vatAmount.toString(),
  },
});
```

#### 2.6 حفظ معلومات VAT في قاعدة البيانات

تأكد من حفظ معلومات VAT في جدول `Order`:

```prisma
// في schema.prisma - تأكد من وجود هذه الحقول
model Order {
  // ... existing fields
  vatAmount        Float?   // مبلغ VAT
  amountExcludingVAT Float? // المبلغ بدون VAT
  vatTRN           String?  // رقم TRN
  invoiceNumber    String?  // رقم الفاتورة
}
```

### 📋 متطلبات الفواتير في الإمارات

كل فاتورة يجب أن تحتوي على:
1. ✅ **اسم الشركة وعنوانها**
2. ✅ **رقم TRN (Tax Registration Number)**
3. ✅ **رقم الفاتورة** (تسلسلي)
4. ✅ **تاريخ الفاتورة**
5. ✅ **وصف المنتجات/الخدمات**
6. ✅ **المبلغ بدون VAT**
7. ✅ **مبلغ VAT (5%)**
8. ✅ **المبلغ الإجمالي**
9. ✅ **معلومات العميل** (اسم، عنوان، TRN إذا كان مسجلاً)

### 📅 التقارير الضريبية

#### 2.7 تقديم إقرار VAT
- **التردد:** كل 3 أشهر (ربع سنوي)
- **الموعد النهائي:** 28 يوم بعد نهاية الربع
- **الطريقة:** عبر FTA Portal

**معلومات مطلوبة:**
- إجمالي المبيعات (شاملة VAT)
- إجمالي المشتريات (شاملة VAT)
- VAT المستحقة (Output VAT)
- VAT القابلة للاسترداد (Input VAT)
- صافي VAT المستحقة

---

## 3. إعدادات البيئة (Environment Variables)

### 📝 قائمة كاملة لمتغيرات البيئة

أضف هذه المتغيرات إلى `.env` في `server/`:

```bash
# ============================================
# Stripe Configuration
# ============================================
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
STRIPE_MODE=test  # أو 'live' للإنتاج

# ============================================
# VAT Configuration (UAE)
# ============================================
VAT_TRN=TRN-XXXXXXXXXX  # Tax Registration Number من FTA
VAT_RATE=0.05  # 5% في الإمارات
VAT_INCLUDED_IN_PRICE=true  # هل الأسعار شاملة VAT؟

# ============================================
# Business Information
# ============================================
COMPANY_NAME=Banda Chao LLC
COMPANY_ADDRESS=[عنوان RAKEZ]
COMPANY_PHONE=+971 XX XXX XXXX
COMPANY_EMAIL=info@bandachao.com
```

### 🔒 الأمان

**⚠️ مهم جداً:**
- ✅ **لا ترفع ملف `.env` إلى GitHub أبداً**
- ✅ أضف `.env` إلى `.gitignore`
- ✅ استخدم **Environment Variables** في Render/Vercel
- ✅ استخدم **مفاتيح مختلفة** للاختبار والإنتاج

---

## 4. اختبار الربط

### ✅ Checklist للاختبار

#### 4.1 اختبار Test Mode
- [ ] إنشاء حساب Stripe والحصول على Test Keys
- [ ] إضافة `STRIPE_SECRET_KEY` إلى `.env`
- [ ] إضافة `STRIPE_WEBHOOK_SECRET` إلى `.env`
- [ ] إنشاء Webhook endpoint في Stripe Dashboard
- [ ] اختبار دفع باستخدام بطاقة اختبار (`4242 4242 4242 4242`)
- [ ] التحقق من استلام Webhook في logs
- [ ] التحقق من تحديث حالة الطلب في قاعدة البيانات

#### 4.2 اختبار VAT
- [ ] حساب VAT بشكل صحيح (5%)
- [ ] عرض VAT في الفاتورة
- [ ] حفظ معلومات VAT في قاعدة البيانات
- [ ] إضافة TRN إلى metadata

#### 4.3 اختبار Live Mode
- [ ] إكمال التحقق من الحساب في Stripe
- [ ] الحصول على Live Keys
- [ ] تحديث Environment Variables في Render
- [ ] اختبار دفع حقيقي بمبلغ صغير ($1)
- [ ] التحقق من وصول الأموال إلى الحساب البنكي

---

## 5. أفضل الممارسات والأمان

### 🔒 الأمان

1. **استخدم HTTPS دائماً:**
   - ✅ تأكد من أن Webhook endpoint يستخدم HTTPS
   - ✅ لا ترسل معلومات بطاقات ائتمان عبر HTTP

2. **تحقق من Webhook Signature:**
   - ✅ دائماً تحقق من توقيع Webhook قبل المعالجة
   - ✅ استخدم `verifyWebhookSignature` في الكود

3. **لا تخزن معلومات بطاقات ائتمان:**
   - ✅ استخدم Stripe Checkout أو Stripe Elements
   - ✅ لا تمرر معلومات البطاقة إلى خادمك

4. **استخدم Environment Variables:**
   - ✅ لا تضع API Keys في الكود
   - ✅ استخدم `.env` للتنمية المحلية
   - ✅ استخدم Environment Variables في Production

### 💡 أفضل الممارسات

1. **معالجة الأخطاء:**
   ```typescript
   try {
     const session = await createCheckoutSession(params);
   } catch (error) {
     if (error instanceof Stripe.errors.StripeError) {
       // معالجة أخطاء Stripe
       console.error('Stripe error:', error.message);
     }
     // معالجة أخطاء عامة
   }
   ```

2. **Logging:**
   - ✅ سجل جميع المعاملات المالية
   - ✅ احتفظ بسجل لجميع Webhook events
   - ✅ استخدم structured logging

3. **Testing:**
   - ✅ اختبر جميع سيناريوهات الدفع (نجاح، فشل، إلغاء)
   - ✅ اختبر Webhook events
   - ✅ استخدم Stripe Test Mode للتطوير

---

## 6. استكشاف الأخطاء

### ❌ مشاكل شائعة وحلولها

#### المشكلة 1: "STRIPE_SECRET_KEY is not set"
**الحل:**
- تأكد من إضافة `STRIPE_SECRET_KEY` إلى `.env`
- أعد تشغيل الخادم بعد إضافة المتغير

#### المشكلة 2: "Webhook signature verification failed"
**الحل:**
- تأكد من صحة `STRIPE_WEBHOOK_SECRET`
- تأكد من أن Webhook endpoint يستقبل raw body
- تحقق من أن Stripe يرسل إلى URL الصحيح

#### المشكلة 3: "Invalid API Key"
**الحل:**
- تأكد من استخدام المفتاح الصحيح (test vs live)
- تحقق من أن المفتاح لم ينتهِ صلاحيته
- تأكد من عدم وجود مسافات إضافية في `.env`

#### المشكلة 4: "VAT calculation incorrect"
**الحل:**
- تحقق من `VAT_RATE` في `.env` (يجب أن يكون 0.05)
- تأكد من منطق الحساب (شامل vs غير شامل)
- اختبر الحسابات يدوياً

---

## 📞 الدعم والمساعدة

### موارد Stripe
- **Documentation:** https://stripe.com/docs
- **Support:** https://support.stripe.com
- **Status Page:** https://status.stripe.com

### موارد FTA (UAE VAT)
- **Website:** https://www.tax.gov.ae
- **Portal:** https://eservices.tax.gov.ae
- **Support:** +971 600 599 994

---

## ✅ Checklist النهائي

قبل الانتقال إلى Live Mode، تأكد من:

- [ ] ✅ إكمال التحقق من حساب Stripe
- [ ] ✅ الحصول على Live API Keys
- [ ] ✅ إعداد Webhook endpoint في Live Mode
- [ ] ✅ التسجيل في VAT والحصول على TRN
- [ ] ✅ تحديث Environment Variables في Production
- [ ] ✅ اختبار جميع الوظائف في Test Mode
- [ ] ✅ إضافة معلومات VAT إلى الفواتير
- [ ] ✅ مراجعة سياسات الإرجاع والاستبدال
- [ ] ✅ إعداد نظام logging للمعاملات المالية
- [ ] ✅ مراجعة الأمان والامتثال

---

**تم إعداد هذا الدليل بواسطة:** فريق التطوير - Banda Chao  
**آخر تحديث:** $(date)  
**الإصدار:** 1.0

---

## 📎 ملاحظات إضافية

### روابط مفيدة:
- [Stripe UAE Documentation](https://stripe.com/docs/payments/checkout)
- [UAE VAT Guide](https://www.tax.gov.ae/en/vat.aspx)
- [RAKEZ Business Setup](https://www.rakez.com)

### ملفات مرتبطة في المشروع:
- `server/src/lib/stripe.ts` - Stripe client configuration
- `server/src/api/payments.ts` - Payment endpoints
- `server/prisma/schema.prisma` - Database schema (Order model)

---

**🎉 تهانينا! أنت الآن جاهز لربط Stripe مع Banda Chao!**

