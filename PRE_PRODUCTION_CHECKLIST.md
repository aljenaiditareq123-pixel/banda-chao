# Pre-Production Checklist - Banda Chao

**تاريخ الإنشاء**: ديسمبر 2024  
**الهدف**: التأكد من جاهزية المشروع للنشر في الإنتاج

---

## ✅ 1. Environment Variables

### Backend (Render/Server)
- [ ] `DATABASE_URL` - صحيح ويشير إلى قاعدة بيانات الإنتاج
- [ ] `JWT_SECRET` - قوي وعشوائي (لا يستخدم القيمة الافتراضية)
- [ ] `JWT_EXPIRES_IN` - مضبوط (مثال: "7d")
- [ ] `PORT` - مضبوط (عادة 3001 أو حسب المنصة)
- [ ] `NODE_ENV` - مضبوط على `production`
- [ ] `FRONTEND_URL` - URL الـ Frontend في الإنتاج (مثال: `https://banda-chao.vercel.app`)
- [ ] `GEMINI_API_KEY` - (إذا كان مستخدماً) مفتاح API صحيح

### Frontend (Vercel/Client)
- [ ] `NEXT_PUBLIC_API_URL` - URL الـ Backend في الإنتاج (مثال: `https://banda-chao-backend.onrender.com`)
- [ ] `NODE_ENV` - مضبوط على `production`

---

## ✅ 2. Database Setup

- [ ] قاعدة البيانات تم إنشاؤها في الإنتاج
- [ ] `DATABASE_URL` صحيح ويشير لقاعدة البيانات الصحيحة
- [ ] تم تشغيل migrations:
  ```bash
  cd server
  npm run db:migrate
  ```
- [ ] (اختياري) تم تشغيل seed script إذا لزم:
  ```bash
  npm run db:seed
  ```
- [ ] تم التحقق من أن جميع الـ indexes موجودة
- [ ] تم التحقق من أن الـ relations تعمل بشكل صحيح

---

## ✅ 3. Payment Configuration

- [ ] `STRIPE_SECRET_KEY` - مفتاح Stripe Secret (Test أو Live حسب الحاجة)
- [ ] `STRIPE_PUBLIC_KEY` - مفتاح Stripe Public (للـ Frontend)
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook secret (إذا كان webhook مفعّل)
- [ ] `STRIPE_MODE` - "test" أو "live" (يجب أن يكون "test" في Beta)
- [ ] **⚠️ مهم**: التأكد من أن وضع test لا يتم نشره للمستخدمين الحقيقيين بدون اتفاق مسبق
- [ ] **⚠️ مهم**: إذا كان webhook مفعّل، التأكد من إعداد webhook endpoint في Stripe Dashboard
- [ ] (مستقبلاً) إعداد Stripe Live keys عند الانتقال للإنتاج الحقيقي

---

## ✅ 4. Security Checklist

- [ ] `JWT_SECRET` قوي (32+ حرف عشوائي)
- [ ] CORS مضبوط بشكل صحيح (يسمح فقط لـ FRONTEND_URL في الإنتاج)
- [ ] Helmet مفعّل ويعمل
- [ ] Rate limiting مفعّل على `/api/v1/auth/*` و `/api/v1/ai/*`
- [ ] Input validation (Zod) مفعّل على جميع endpoints المهمة
- [ ] Error messages لا تكشف معلومات حساسة في الإنتاج
- [ ] HTTPS مفعّل في الإنتاج (عبر Render/Vercel)

---

## ✅ 5. Build & Deploy

### Backend
- [ ] `npm run build` يعمل بدون أخطاء
- [ ] `npm start` يعمل بشكل صحيح
- [ ] Health check endpoint (`/api/health`) يعمل
- [ ] جميع الـ API endpoints تستجيب بشكل صحيح

### Frontend
- [ ] `npm run build` يعمل بدون أخطاء
- [ ] `npm start` يعمل بشكل صحيح
- [ ] جميع الصفحات الرئيسية تعمل:
  - [ ] `/zh`, `/en`, `/ar` (الصفحة الرئيسية)
  - [ ] `/zh/makers`, `/zh/products`, `/zh/videos`
  - [ ] `/founder`
- [ ] i18n يعمل بشكل صحيح
- [ ] RTL يعمل للعربية

---

## ✅ 6. Testing

### Backend Tests
- [ ] جميع الاختبارات تمر:
  ```bash
  cd server
  npm test
  ```
- [ ] لا توجد أخطاء TypeScript:
  ```bash
  npm run build
  ```

### Frontend Tests
- [ ] جميع الاختبارات تمر:
  ```bash
  npm test
  ```
- [ ] لا توجد أخطاء TypeScript:
  ```bash
  npm run type-check
  ```

---

## ✅ 7. Performance

- [ ] Pagination يعمل على جميع endpoints
- [ ] لا توجد N+1 queries واضحة
- [ ] Database indexes موجودة على الحقول المهمة:
  - [ ] `User.email`
  - [ ] `Product.makerId`
  - [ ] `Video.makerId`
  - [ ] `Post.createdAt`
  - [ ] `Comment.createdAt`
- [ ] Response times معقولة (< 500ms للـ API calls العادية)

---

## ✅ 8. Monitoring & Logging

- [ ] Error handling middleware يعمل
- [ ] Request logger يعمل في التطوير (مغلق في الإنتاج)
- [ ] (مستقبلاً) إعداد error tracking (Sentry)
- [ ] (مستقبلاً) إعداد performance monitoring

---

## ✅ 9. Content & Data

- [ ] Seed data موجود (إذا لزم)
- [ ] Founder user موجود
- [ ] Test makers موجودون (إذا لزم)
- [ ] Test products موجودة (إذا لزم)

---

## ✅ 10. Documentation

- [ ] `README.md` محدث
- [ ] `DEPLOYMENT.md` محدث
- [ ] `TESTING.md` موجود
- [ ] `COMPREHENSIVE_REPORT.md` محدث
- [ ] `.env.example` موجود ومحدث

---

## ✅ 11. Final Checks

- [ ] تم اختبار جميع الصفحات الرئيسية يدوياً
- [ ] تم اختبار Authentication (register, login, me)
- [ ] تم اختبار CRUD operations (إذا كانت موجودة)
- [ ] تم اختبار AI Assistant (إذا كان مفعلاً)
- [ ] تم اختبار Responsive design على mobile/tablet/desktop
- [ ] تم اختبار i18n (ar, en, zh)
- [ ] تم اختبار RTL للعربية

---

## 🚨 Critical Issues (يجب إصلاحها قبل النشر)

- [ ] لا توجد أخطاء TypeScript
- [ ] لا توجد أخطاء في console (Frontend)
- [ ] جميع الاختبارات تمر
- [ ] Security features مفعّلة
- [ ] Environment variables صحيحة

---

## 📝 Notes

- **تاريخ آخر تحديث**: ديسمبر 2024
- **آخر من راجع**: [اسم المراجع]
- **حالة النشر**: [ ] جاهز | [ ] غير جاهز | [ ] يحتاج مراجعة

---

**ملاحظة**: هذا Checklist يجب مراجعته قبل كل نشر في الإنتاج.

