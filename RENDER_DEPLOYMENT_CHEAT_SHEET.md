# 🚀 Render Deployment Cheat Sheet - قائمة النسخ واللصق النهائية

**تاريخ الإنشاء:** يناير 2025  
**الحالة:** ✅ جاهز للنشر

---

## 📋 الأوامر (Commands)

### Build Command:
```bash
npm install --legacy-peer-deps && npx prisma generate && npm run build
```

### Start Command (Option 1 - Recommended):
```bash
npm start
```

### Start Command (Option 2 - Standalone Mode):
```bash
cd .next/standalone && node server.js
```
**Note:** Use Option 1 (`npm start`) if standalone folder doesn't exist. It's more stable and works with standard Next.js build output.

---

## 🔐 متغيرات البيئة (Environment Variables)

### ⚠️ ملاحظة مهمة:
- القيم التي تحتوي على `(يجب توليدها)` تعني أنك تحتاج لتوليدها أو نسخها من مكان آخر
- القيم التي تحتوي على `(من Render)` تعني أن Render يوفرها تلقائياً
- استبدل `your-frontend-url.onrender.com` و `your-backend-url.onrender.com` بالعناوين الفعلية

---

### 🔴 متغيرات أساسية (Essential - مطلوبة):

| المفتاح (Key) | القيمة (Value) | ملاحظات |
|--------------|----------------|----------|
| `NODE_ENV` | `production` | وضع الإنتاج |
| `PORT` | `3000` | (Render يضيفه تلقائياً، لكن يمكن تحديده) |
| `DATABASE_URL` | `(يجب نسخها من Render Database)` | PostgreSQL connection string من Render Database Dashboard → Connection String |
| `NEXT_PUBLIC_FRONTEND_URL` | `https://your-frontend-url.onrender.com` | رابط موقعك الأمامي (استبدله بالرابط الفعلي) |
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.onrender.com` | رابط الـ Backend API (استبدله بالرابط الفعلي) |

---

### 🔐 متغيرات المصادقة (Authentication - مطلوبة):

| المفتاح (Key) | القيمة (Value) | ملاحظات |
|--------------|----------------|----------|
| `AUTH_URL` | `https://your-frontend-url.onrender.com` | رابط موقعك الأمامي (NextAuth v5) |
| `AUTH_SECRET` | `(يجب توليدها - استخدم Render Generate Value)` | مفتاح سري لـ NextAuth - يمكن استخدام: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-frontend-url.onrender.com` | رابط موقعك الأمامي (Legacy support) |
| `NEXTAUTH_SECRET` | `(يجب توليدها - استخدم Render Generate Value)` | مفتاح سري لـ NextAuth (Legacy) - يمكن استخدام: `openssl rand -base64 32` |
| `JWT_SECRET` | `(يجب توليدها)` | مفتاح JWT - على الأقل 32 حرف: `openssl rand -base64 32` |
| `JWT_EXPIRES_IN` | `7d` | مدة صلاحية JWT (اختياري، القيمة الافتراضية: 7d) |

---

### 🤖 متغيرات الذكاء الاصطناعي (AI Features):

| المفتاح (Key) | القيمة (Value) | ملاحظات |
|--------------|----------------|----------|
| `GEMINI_API_KEY` | `(يجب نسخها من Google AI Studio)` | مفتاح Gemini API للوظائف الذكية (12 AI Bricks) |
| `GOOGLE_SPEECH_API_KEY` | `(اختياري - يمكن استخدام GEMINI_API_KEY)` | مفتاح Google Speech-to-Text API (للأوامر الصوتية) |

---

### 💳 متغيرات الدفع (Payment - Stripe):

| المفتاح (Key) | القيمة (Value) | ملاحظات |
|--------------|----------------|----------|
| `STRIPE_SECRET_KEY` | `sk_live_...` أو `sk_test_...` | مفتاح Stripe السري (من Stripe Dashboard → API Keys) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` أو `pk_test_...` | مفتاح Stripe العام (من Stripe Dashboard → API Keys) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | مفتاح Webhook Secret (من Stripe Dashboard → Webhooks) |
| `STRIPE_MODE` | `production` | وضع Stripe (production أو test) |

---

### ☁️ متغيرات التخزين السحابي (Cloud Storage - Google Cloud):

| المفتاح (Key) | القيمة (Value) | ملاحظات |
|--------------|----------------|----------|
| `GCLOUD_PROJECT_ID` | `banda-chao` | معرف مشروع Google Cloud |
| `GCS_BUCKET_NAME` | `banda-chao-uploads-tareq` | اسم Bucket في Google Cloud Storage |
| `GCS_SERVICE_ACCOUNT_KEY` | `(JSON كامل - يجب نسخه)` | Service Account Key كـ JSON من Google Cloud Console |

---

### 🔗 متغيرات الروابط (URLs - Backend):

| المفتاح (Key) | القيمة (Value) | ملاحظات |
|--------------|----------------|----------|
| `FRONTEND_URL` | `https://your-frontend-url.onrender.com` | رابط Frontend (للـ Backend service فقط) |

---

### 🔍 متغيرات المراقبة والتحليل (Monitoring - اختيارية):

| المفتاح (Key) | القيمة (Value) | ملاحظات |
|--------------|----------------|----------|
| `SENTRY_DSN` | `(اختياري)` | Sentry DSN لمراقبة الأخطاء |

---

### 🔑 متغيرات OAuth (Social Login - اختيارية):

| المفتاح (Key) | القيمة (Value) | ملاحظات |
|--------------|----------------|----------|
| `GOOGLE_CLIENT_ID` | `(اختياري)` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | `(اختياري)` | Google OAuth Client Secret |
| `FACEBOOK_CLIENT_ID` | `(اختياري)` | Facebook App ID |
| `FACEBOOK_CLIENT_SECRET` | `(اختياري)` | Facebook App Secret |
| `TWITTER_CLIENT_ID` | `(اختياري)` | Twitter OAuth Client ID |
| `TWITTER_CLIENT_SECRET` | `(اختياري)` | Twitter OAuth Client Secret |
| `WECHAT_APP_ID` | `(اختياري)` | WeChat App ID |
| `WECHAT_APP_SECRET` | `(اختياري)` | WeChat App Secret |

### 📊 متغيرات أخرى (Other - اختيارية):

| المفتاح (Key) | القيمة (Value) | ملاحظات |
|--------------|----------------|----------|
| `COMMISSION_RATE` | `0.10` | معدل العمولة (10% - اختياري) |
| `FOUNDER_EMAIL` | `(اختياري)` | بريد المؤسس |

---

## 📝 خطوات النسخ واللصق:

### 1️⃣ في Render Dashboard → Web Service → Environment:

1. انقر على **"Add Environment Variable"**
2. انسخ كل **Key** و **Value** من الجدول أعلاه
3. للقيم التي تحتاج توليد:
   - `AUTH_SECRET` / `NEXTAUTH_SECRET`: استخدم زر **"Generate Value"** في Render أو شغل: `openssl rand -base64 32`
   - `JWT_SECRET`: استخدم: `openssl rand -base64 32`
   - `DATABASE_URL`: انسخها من Render Database Dashboard → Connection String
   - `GEMINI_API_KEY`: انسخها من Google AI Studio
   - `STRIPE_*`: انسخها من Stripe Dashboard

---

## ✅ قائمة التحقق السريعة:

- [ ] تم إضافة جميع المتغيرات الأساسية (Essential)
- [ ] تم إضافة متغيرات المصادقة (Authentication)
- [ ] تم توليد أو نسخ `AUTH_SECRET` و `NEXTAUTH_SECRET`
- [ ] تم نسخ `DATABASE_URL` من Render Database
- [ ] تم نسخ `GEMINI_API_KEY` من Google AI Studio
- [ ] تم نسخ مفاتيح Stripe (إذا كنت تستخدم Stripe)
- [ ] تم تحديث `NEXT_PUBLIC_FRONTEND_URL` و `NEXT_PUBLIC_API_URL` بالعناوين الفعلية
- [ ] تم إضافة Build Command و Start Command

---

## 🎯 الأوامر المختصرة للنسخ:

### Build Command:
```
npm install --legacy-peer-deps && prisma generate && npm run build
```

### Start Command:
```
cd .next/standalone && node server.js
```

---

## ⚠️ تحذيرات أمنية:

1. ❌ **لا تشارك** ملفات `.env` أو هذه القائمة إذا كانت تحتوي على قيم فعلية
2. ✅ **استخدم Render Environment Variables** دائماً للإنتاج
3. ✅ **احذف** هذه القائمة بعد النشر إذا كانت تحتوي على قيم سرية
4. ✅ **تحقق** من أن جميع المفاتيح السرية تم توليدها بشكل عشوائي

---

**🎉 جاهز للنشر! قم بالنسخ واللصق من الجداول أعلاه مباشرة إلى Render Dashboard.**
