# 🔐 دليل متغيرات البيئة في Render - Banda Chao
# Render Environment Variables Guide - Banda Chao

**آخر تحديث:** 8 يناير 2026  
**Last Updated:** January 8, 2026

---

## 📋 نظرة عامة (Overview)

لدينا **خدمتان منفصلتان** على Render:
1. **Frontend Service** - Next.js Application (`banda-chao-frontend`)
2. **Backend Service** - Express API Server (`banda-chao-backend`)

كل خدمة لها Environment Variables خاصة بها. هذا الملف يوضح القيم الصحيحة لكل متغير.

---

## 🎨 Frontend Service: `banda-chao-frontend`

### 📍 URL الخاص بالخدمة:
```
https://banda-chao-frontend.onrender.com
```

### ✅ Environment Variables المطلوبة:

#### 1. **NEXTAUTH_URL** ⚠️ مهم جداً
```env
NEXTAUTH_URL=https://banda-chao-frontend.onrender.com
```

**لماذا هذا مهم؟**
- NextAuth يعمل **داخل** Frontend service
- يستخدم NextAuth هذا الرابط لبناء callback URLs بعد تسجيل الدخول
- يستخدمه لإنشاء redirect URLs الصحيحة
- ❌ **خطأ شائع**: تعيينه إلى Backend URL (يسبب مشاكل في redirects)

**القيمة الصحيحة:**
- ✅ `https://banda-chao-frontend.onrender.com` (Frontend URL)
- ❌ `https://banda-chao-backend.onrender.com` (Backend URL - خطأ!)
- ❌ `https://banda-chao.onrender.com` (URL قديم - خطأ!)

---

#### 2. **NEXTAUTH_SECRET** / **AUTH_SECRET**
```env
AUTH_SECRET=your-very-secure-random-secret-key-here
# أو
NEXTAUTH_SECRET=your-very-secure-random-secret-key-here
```

**لماذا هذا مهم؟**
- يستخدم لتوقيع وتشفير JWT tokens
- يجب أن يكون قيمة عشوائية قوية (32+ حرف)

**كيف تولد قيمة آمنة؟**
```bash
openssl rand -base64 32
```

**ملاحظة:**
- الكود يدعم كلا المتغيرين (`AUTH_SECRET` أو `NEXTAUTH_SECRET`)
- لكن الأفضل استخدام `AUTH_SECRET` (NextAuth v5)

---

#### 3. **NEXT_PUBLIC_API_URL**
```env
NEXT_PUBLIC_API_URL=https://banda-chao-backend.onrender.com
```

**لماذا هذا مهم؟**
- Frontend يستخدمه للاتصال بـ Backend API
- يجب أن يشير إلى **Backend service URL**

**القيمة الصحيحة:**
- ✅ `https://banda-chao-backend.onrender.com` (Backend URL)
- ❌ `https://banda-chao-frontend.onrender.com` (Frontend URL - خطأ!)

**استخدامه في الكود:**
- يستخدم في `lib/api-utils.ts` لبناء API URLs
- يستخدم في SSR (Server-Side Rendering) للاتصال بالـ Backend

---

#### 4. **NEXT_PUBLIC_FRONTEND_URL** (اختياري)
```env
NEXT_PUBLIC_FRONTEND_URL=https://banda-chao-frontend.onrender.com
```

**لماذا هذا مهم؟**
- يستخدم لبناء URLs مطلقة في Frontend
- قد يستخدمه بعض المكونات لبناء links

---

#### 5. **NODE_ENV**
```env
NODE_ENV=production
```

**لماذا هذا مهم؟**
- يحدد بيئة التشغيل (production/development)
- يؤثر على سلوك Next.js (minification, error handling, etc.)

---

#### 6. **DATABASE_URL**
```env
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
```

**لماذا هذا مهم؟**
- Frontend يحتاج قاعدة البيانات أيضاً (لـ Prisma Client)
- يستخدم في SSR لجلب البيانات
- نفس القيمة المستخدمة في Backend

**كيف تحصل عليه؟**
- Render Dashboard → PostgreSQL Database → Connection String

---

#### 7. **PORT** (اختياري - Render يضيفه تلقائياً)
```env
PORT=10000
```

**ملاحظة:**
- Render يضيف PORT تلقائياً عادة
- لكن يمكن تحديده يدوياً إذا لزم الأمر

---

### 📝 قائمة كاملة - Frontend Environment Variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=https://banda-chao-frontend.onrender.com
AUTH_SECRET=your-secret-key-here
# أو
NEXTAUTH_SECRET=your-secret-key-here

# API Configuration
NEXT_PUBLIC_API_URL=https://banda-chao-backend.onrender.com
NEXT_PUBLIC_FRONTEND_URL=https://banda-chao-frontend.onrender.com

# Environment
NODE_ENV=production

# Database (لـ Prisma Client في SSR)
DATABASE_URL=postgresql://user:password@host:port/database?schema=public

# Port (اختياري - Render يضيفه تلقائياً)
PORT=10000

# OAuth Providers (اختياري - حسب الحاجة)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret
NEXT_PUBLIC_WECHAT_APP_ID=your-wechat-app-id

FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
NEXT_PUBLIC_FACEBOOK_CLIENT_ID=your-facebook-app-id

# Stripe (اختياري)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Sentry (اختياري)
NEXT_PUBLIC_SENTRY_DSN=https://...

# Socket.io (اختياري)
NEXT_PUBLIC_SOCKET_URL=https://banda-chao-backend.onrender.com

# Owner Email (للمزايا الخاصة)
OWNER_EMAIL=founder@bandachao.com
```

---

## ⚙️ Backend Service: `banda-chao-backend`

### 📍 URL الخاص بالخدمة:
```
https://banda-chao-backend.onrender.com
```

### ✅ Environment Variables المطلوبة:

#### 1. **FRONTEND_URL**
```env
FRONTEND_URL=https://banda-chao-frontend.onrender.com
```

**لماذا هذا مهم؟**
- Backend يستخدمه لإعداد CORS (Cross-Origin Resource Sharing)
- يسمح للـ Frontend بالاتصال بالـ Backend
- ❌ **بدون هذا**: Frontend لن يستطيع الاتصال بالـ Backend (CORS error)

**القيمة الصحيحة:**
- ✅ `https://banda-chao-frontend.onrender.com` (Frontend URL)
- ❌ `https://banda-chao-backend.onrender.com` (Backend URL - خطأ!)

---

#### 2. **DATABASE_URL**
```env
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
```

**لماذا هذا مهم؟**
- Backend يحتاج قاعدة البيانات لجميع العمليات
- Prisma يستخدمه للاتصال بقاعدة البيانات

**نفس القيمة المستخدمة في Frontend** (نفس قاعدة البيانات)

---

#### 3. **JWT_SECRET**
```env
JWT_SECRET=your-very-secure-random-secret-key-here
```

**لماذا هذا مهم؟**
- Backend يستخدمه لتوقيع JWT tokens
- يجب أن يكون قيمة عشوائية قوية (32+ حرف)
- **ملاحظة**: هذا مختلف عن `AUTH_SECRET` في Frontend (لكل واحد secret خاص)

**كيف تولد قيمة آمنة؟**
```bash
openssl rand -base64 32
```

---

#### 4. **NODE_ENV**
```env
NODE_ENV=production
```

**لماذا هذا مهم؟**
- يحدد بيئة التشغيل (production/development)
- يؤثر على سلوك Express server

---

#### 5. **PORT** (اختياري - Render يضيفه تلقائياً)
```env
PORT=10000
```

**ملاحظة:**
- Render يضيف PORT تلقائياً عادة
- Backend يجب أن يستمع على `0.0.0.0` وليس `localhost`

---

### 📝 قائمة كاملة - Backend Environment Variables:

```env
# CORS Configuration
FRONTEND_URL=https://banda-chao-frontend.onrender.com

# Database
DATABASE_URL=postgresql://user:password@host:port/database?schema=public

# JWT Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Environment
NODE_ENV=production

# Port (اختياري - Render يضيفه تلقائياً)
PORT=10000

# Stripe (اختياري)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_MODE=production

# AI Services (اختياري)
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# Email (اختياري)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Owner Email (للمزايا الخاصة)
OWNER_EMAIL=founder@bandachao.com
```

---

## 🔍 الفرق الرئيسي بين Frontend و Backend:

### Frontend (`banda-chao-frontend`):
- ✅ يحتاج `NEXTAUTH_URL` → يشير إلى **Frontend URL**
- ✅ يحتاج `NEXT_PUBLIC_API_URL` → يشير إلى **Backend URL**
- ✅ يحتاج `AUTH_SECRET` / `NEXTAUTH_SECRET` → لـ NextAuth

### Backend (`banda-chao-backend`):
- ✅ يحتاج `FRONTEND_URL` → يشير إلى **Frontend URL** (لـ CORS)
- ❌ **لا يحتاج** `NEXTAUTH_URL` (NextAuth في Frontend فقط)
- ✅ يحتاج `JWT_SECRET` → لـ JWT tokens

---

## ⚠️ الأخطاء الشائعة:

### ❌ خطأ #1: NEXTAUTH_URL يشير إلى Backend
```env
# ❌ خطأ
NEXTAUTH_URL=https://banda-chao-backend.onrender.com

# ✅ صحيح
NEXTAUTH_URL=https://banda-chao-frontend.onrender.com
```

**النتيجة:**
- مشاكل في redirect URLs بعد تسجيل الدخول
- CSRF token validation failures

---

### ❌ خطأ #2: NEXT_PUBLIC_API_URL يشير إلى Frontend
```env
# ❌ خطأ
NEXT_PUBLIC_API_URL=https://banda-chao-frontend.onrender.com

# ✅ صحيح
NEXT_PUBLIC_API_URL=https://banda-chao-backend.onrender.com
```

**النتيجة:**
- 404 errors عند محاولة جلب البيانات
- Frontend يحاول الاتصال بنفسه بدلاً من Backend

---

### ❌ خطأ #3: FRONTEND_URL في Backend يشير إلى Backend
```env
# ❌ خطأ
FRONTEND_URL=https://banda-chao-backend.onrender.com

# ✅ صحيح
FRONTEND_URL=https://banda-chao-frontend.onrender.com
```

**النتيجة:**
- CORS errors
- Frontend لا يستطيع الاتصال بالـ Backend

---

## 📋 Checklist للتحقق:

### Frontend Service Checklist:
- [ ] `NEXTAUTH_URL` = `https://banda-chao-frontend.onrender.com` ✅
- [ ] `NEXT_PUBLIC_API_URL` = `https://banda-chao-backend.onrender.com` ✅
- [ ] `AUTH_SECRET` أو `NEXTAUTH_SECRET` موجود وقوي ✅
- [ ] `DATABASE_URL` موجود وصحيح ✅
- [ ] `NODE_ENV` = `production` ✅

### Backend Service Checklist:
- [ ] `FRONTEND_URL` = `https://banda-chao-frontend.onrender.com` ✅
- [ ] `DATABASE_URL` موجود وصحيح ✅
- [ ] `JWT_SECRET` موجود وقوي ✅
- [ ] `NODE_ENV` = `production` ✅

---

## 🔧 كيفية التحقق من الإعدادات:

### 1. في Render Dashboard:
1. اذهب إلى Render Dashboard
2. افتح Frontend Service → Environment
3. تأكد من جميع القيم المذكورة أعلاه
4. كرر نفس الخطوة لـ Backend Service

### 2. في الكود (للتحقق):
```typescript
// في Frontend
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

// في Backend
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
```

### 3. اختبار الاتصال:
- Frontend → Backend: افتح Developer Tools → Network → تحقق من API calls
- Backend → Frontend: تحقق من CORS headers في response

---

## 📚 مراجع إضافية:

- [NextAuth.js Documentation](https://next-auth.js.org/configuration/options)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Prisma Environment Variables](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/generating-prisma-client#environment-variables)

---

## 🔄 تحديث هذا الملف:

عند إضافة متغيرات بيئة جديدة:
1. أضفها في القسم المناسب (Frontend أو Backend)
2. اشرح لماذا هذا المتغير مهم
3. اذكر القيمة الصحيحة
4. حدّث التاريخ في الأعلى

---

**آخر تحديث:** 8 يناير 2026  
**صانع الملف:** Tariq Al-Janaidi (Founder, Banda Chao FZ-LLC)
