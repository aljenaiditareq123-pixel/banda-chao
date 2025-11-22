# 🚀 دليل النشر الإنتاجي الشامل - Banda Chao Production Deployment Guide

## 📋 جدول المحتويات

1. [متطلبات ما قبل النشر](#متطلبات-ما-قبل-النشر)
2. [إعداد قاعدة البيانات](#إعداد-قاعدة-البيانات)
3. [إعداد Backend (Render)](#إعداد-backend-render)
4. [إعداد Frontend (Vercel)](#إعداد-frontend-vercel)
5. [إعداد متغيرات البيئة](#إعداد-متغيرات-البيئة)
6. [اختبار النشر](#اختبار-النشر)
7. [المراقبة والصيانة](#المراقبة-والصيانة)
8. [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## 🔧 متطلبات ما قبل النشر

### 1. الحسابات المطلوبة
- ✅ **Render Account**: https://render.com (للـ Backend و Database)
- ✅ **Vercel Account**: https://vercel.com (للـ Frontend)
- ✅ **Google Cloud Account**: https://console.cloud.google.com (لـ Gemini API)
- ✅ **Stripe Account**: https://stripe.com (للمدفوعات)
- ✅ **GitHub Repository**: مع الكود الحالي

### 2. المفاتيح والأسرار المطلوبة
```bash
# AI Service
GEMINI_API_KEY=AIza...  # من Google AI Studio

# Database
DATABASE_URL=postgresql://...  # سيتم إنشاؤه تلقائياً من Render

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here  # قم بإنشائه

# Payments (اختياري للبداية)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Founder Access
FOUNDER_EMAIL=your-email@example.com
```

---

## 🗄️ إعداد قاعدة البيانات

### 1. إنشاء PostgreSQL Database في Render

1. **اذهب إلى Render Dashboard**:
   - https://dashboard.render.com
   - انقر على "New" → "PostgreSQL"

2. **إعدادات Database**:
   ```
   Name: banda-chao-db
   Database: banda_chao
   User: banda_chao_user
   Region: Oregon (US West) أو الأقرب لك
   PostgreSQL Version: 15
   Plan: Free (للبداية) أو Starter ($7/month)
   ```

3. **احفظ معلومات الاتصال**:
   - سيتم إنشاء `DATABASE_URL` تلقائياً
   - احفظه لاستخدامه في Backend

### 2. تشغيل Migrations

```bash
# في مجلد server
cd server
npm install
npx prisma migrate deploy
npx prisma generate
```

---

## 🖥️ إعداد Backend (Render)

### 1. إنشاء Web Service في Render

1. **اذهب إلى Render Dashboard**:
   - انقر على "New" → "Web Service"
   - اربط GitHub Repository

2. **إعدادات Service**:
   ```
   Name: banda-chao-backend
   Environment: Node
   Region: Oregon (US West)
   Branch: main (أو master)
   Root Directory: server
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Free (للبداية) أو Starter ($7/month)
   ```

### 2. إعداد Environment Variables في Render

في Render Dashboard → Service → Environment:

```bash
# Database
DATABASE_URL=postgresql://banda_chao_user:password@dpg-xxx.oregon-postgres.render.com/banda_chao

# Environment
NODE_ENV=production

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d

# AI Service
GEMINI_API_KEY=AIzaSyC...HBK0
GEMINI_MODEL=gemini-1.5-flash

# CORS & Frontend
FRONTEND_URL=https://banda-chao.vercel.app

# Founder Access
FOUNDER_EMAIL=your-email@example.com

# Payments (اختياري)
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# Port (Render يحدده تلقائياً)
PORT=10000
```

### 3. إعداد Custom Domain (اختياري)

1. في Render Dashboard → Service → Settings → Custom Domains
2. أضف domain مثل: `api.banda-chao.com`
3. اتبع تعليمات DNS

---

## 🌐 إعداد Frontend (Vercel)

### 1. ربط Repository بـ Vercel

1. **اذهب إلى Vercel Dashboard**:
   - https://vercel.com/dashboard
   - انقر على "New Project"
   - اختر GitHub Repository

2. **إعدادات Project**:
   ```
   Project Name: banda-chao
   Framework Preset: Next.js
   Root Directory: / (المجلد الرئيسي)
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

### 2. إعداد Environment Variables في Vercel

في Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Backend API
NEXT_PUBLIC_API_URL=https://banda-chao-backend.onrender.com/api/v1
NEXT_PUBLIC_BACKEND_URL=https://banda-chao-backend.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://banda-chao-backend.onrender.com

# Payments (اختياري)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...

# Environment
NODE_ENV=production
```

### 3. إعداد Custom Domain (اختياري)

1. في Vercel Dashboard → Project → Settings → Domains
2. أضف domain مثل: `banda-chao.com`
3. اتبع تعليمات DNS

---

## 🔐 إعداد متغيرات البيئة

### Backend Environment Variables (Render)

```bash
# ✅ مطلوب
DATABASE_URL=postgresql://...
NODE_ENV=production
JWT_SECRET=your-jwt-secret
GEMINI_API_KEY=AIza...
FRONTEND_URL=https://banda-chao.vercel.app
FOUNDER_EMAIL=your-email@example.com

# 🔶 اختياري
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
GEMINI_MODEL=gemini-1.5-flash
JWT_EXPIRES_IN=7d
PORT=10000
```

### Frontend Environment Variables (Vercel)

```bash
# ✅ مطلوب
NEXT_PUBLIC_API_URL=https://banda-chao-backend.onrender.com/api/v1
NEXT_PUBLIC_BACKEND_URL=https://banda-chao-backend.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://banda-chao-backend.onrender.com

# 🔶 اختياري
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
NODE_ENV=production
```

---

## 🧪 اختبار النشر

### 1. اختبار Backend

```bash
# Health Check
curl https://banda-chao-backend.onrender.com/api/health

# Expected Response:
{
  "status": "ok",
  "message": "Banda Chao Server is running",
  "timestamp": "2025-01-XX..."
}

# AI Health Check
curl https://banda-chao-backend.onrender.com/api/v1/ai/health

# Expected Response:
{
  "status": "ok",
  "service": "AI Assistant",
  "apiKeyConfigured": true,
  "model": "gemini-1.5-flash"
}
```

### 2. اختبار Frontend

1. **افتح الموقع**: https://banda-chao.vercel.app
2. **اختبر الميزات الأساسية**:
   - ✅ تحميل الصفحة الرئيسية
   - ✅ تسجيل الدخول/التسجيل
   - ✅ تصفح المنتجات
   - ✅ البحث
   - ✅ Founder Console (`/founder/assistant`)

### 3. اختبار AI Assistant

1. اذهب إلى: `/founder/assistant`
2. اختر "باندا المؤسس"
3. أرسل رسالة: "مرحباً"
4. يجب أن تحصل على رد من الباندا

### 4. اختبار Socket.io

1. افتح Browser DevTools → Network
2. ابحث عن WebSocket connections
3. يجب أن تكون: `wss://banda-chao-backend.onrender.com/socket.io/...`
4. لا يجب أن تكون: `ws://localhost:3001/...`

---

## 📊 المراقبة والصيانة

### 1. مراقبة Render Services

**Backend Monitoring**:
- Render Dashboard → Service → Metrics
- مراقبة: CPU, Memory, Response Time
- Logs: Render Dashboard → Service → Logs

**Database Monitoring**:
- Render Dashboard → Database → Metrics
- مراقبة: Connections, Storage, Performance

### 2. مراقبة Vercel Deployment

**Frontend Monitoring**:
- Vercel Dashboard → Project → Analytics
- مراقبة: Page Views, Performance, Errors
- Logs: Vercel Dashboard → Project → Functions

### 3. Performance Monitoring

```javascript
// في Frontend - إضافة لـ _app.tsx
import { PerformanceMonitor } from '@/lib/performance-utils';

// Log page load metrics
useEffect(() => {
  PerformanceMonitor.logPageLoadMetrics();
}, []);
```

### 4. Error Monitoring (اختياري)

**Sentry Integration**:
```bash
npm install @sentry/nextjs @sentry/node
```

---

## 🔍 استكشاف الأخطاء

### مشاكل شائعة وحلولها

#### 1. Backend لا يعمل

**الأعراض**: 
- Frontend يعرض أخطاء API
- Health check يفشل

**الحلول**:
```bash
# تحقق من Render Logs
# Render Dashboard → Service → Logs

# تحقق من Environment Variables
# تأكد من وجود: DATABASE_URL, GEMINI_API_KEY, JWT_SECRET

# إعادة Deploy
# Render Dashboard → Service → Manual Deploy
```

#### 2. Database Connection Issues

**الأعراض**:
- "Database connection failed"
- "Prisma client initialization failed"

**الحلول**:
```bash
# تحقق من DATABASE_URL في Render
# تأكد من أن Database يعمل
# Render Dashboard → Database → Check Status

# إعادة تشغيل Migrations
cd server
npx prisma migrate deploy
npx prisma generate
```

#### 3. AI Assistant لا يعمل

**الأعراض**:
- "401 Unauthorized" من AI endpoint
- "GEMINI_API_KEY not configured"

**الحلول**:
```bash
# تحقق من GEMINI_API_KEY في Render Environment Variables
# تأكد من أن المفتاح صحيح وفعال
# اختبر المفتاح في Google AI Studio

# إعادة Deploy Backend
```

#### 4. Socket.io Connection Issues

**الأعراض**:
- "WebSocket connection failed"
- "localhost:3001" في Production

**الحلول**:
```bash
# تحقق من NEXT_PUBLIC_SOCKET_URL في Vercel
# يجب أن يكون: https://banda-chao-backend.onrender.com

# Clear Browser Cache
# Hard Reload: Ctrl+Shift+R

# إعادة Deploy Frontend
```

#### 5. CORS Issues

**الأعراض**:
- "CORS policy blocked"
- API calls تفشل من Frontend

**الحلول**:
```bash
# تحقق من FRONTEND_URL في Backend Environment Variables
# يجب أن يكون: https://banda-chao.vercel.app

# تأكد من إعدادات CORS في server/src/index.ts
```

---

## 📝 Checklist للنشر

### قبل النشر
- [ ] جميع Environment Variables محددة
- [ ] Database جاهز ومتصل
- [ ] Migrations تم تشغيلها
- [ ] جميع API Keys صحيحة
- [ ] الكود تم اختباره محلياً

### بعد النشر
- [ ] Backend Health Check يعمل
- [ ] Frontend يحمل بدون أخطاء
- [ ] AI Assistant يعمل
- [ ] Socket.io متصل
- [ ] Database queries تعمل
- [ ] Authentication يعمل
- [ ] Founder Console يعمل

### مراقبة مستمرة
- [ ] مراقبة Logs يومياً
- [ ] فحص Performance أسبوعياً
- [ ] تحديث Dependencies شهرياً
- [ ] Backup Database أسبوعياً

---

## 🎯 الخطوات التالية

### المرحلة 1: Beta Launch (الأسبوع الأول)
1. نشر النسخة الحالية
2. دعوة 10-20 مستخدم للاختبار
3. جمع التعليقات
4. إصلاح المشاكل العاجلة

### المرحلة 2: Public Launch (الشهر الأول)
1. تحسين الأداء
2. إضافة ميزات ناقصة
3. تحسين UX
4. إطلاق حملة تسويقية

### المرحلة 3: Scale & Grow (الأشهر التالية)
1. ترقية الخطط (Render Starter, Vercel Pro)
2. إضافة CDN
3. تحسين Database
4. إضافة Analytics متقدمة

---

**🎉 تهانينا! مشروع Banda Chao جاهز للإطلاق!**

للدعم والمساعدة، راجع:
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
