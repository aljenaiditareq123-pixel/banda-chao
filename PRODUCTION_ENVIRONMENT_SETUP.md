# 🚀 دليل إعداد البيئة الإنتاجية - Production Environment Setup

## المشكلة الحالية
Frontend يتصل بـ Backend URLs خاطئة، مما يسبب أخطاء 500 و Socket.io failures.

## الحل الشامل

### 1. 🎯 Render Backend Service

#### أ) التحقق من اسم الخدمة الصحيح
1. اذهب إلى: https://dashboard.render.com
2. ابحث عن الخدمة الصحيحة:
   - ✅ **الاسم المتوقع**: `banda-chao` أو `banda-chao-backend`
   - ✅ **URL الصحيح**: `https://banda-chao.onrender.com`

#### ب) Environment Variables في Backend
تأكد من وجود هذه المتغيرات في Render Backend:

```bash
# Database
DATABASE_URL=postgresql://...  # من Render PostgreSQL

# Authentication
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d

# AI Service
GEMINI_API_KEY=AIza...HBK0  # من Google AI Studio

# CORS & Frontend
FRONTEND_URL=https://banda-chao-frontend.onrender.com
# أو إذا كان على Vercel:
# FRONTEND_URL=https://banda-chao.vercel.app

# Environment
NODE_ENV=production

# Payments (إذا كان مفعل)
STRIPE_SECRET_KEY=sk_live_...  # أو sk_test_ للاختبار
STRIPE_WEBHOOK_SECRET=whsec_...

# Founder Access
FOUNDER_EMAIL=your-email@example.com
```

### 2. 🎯 Frontend Service (Vercel أو Render)

#### أ) إذا كان Frontend على Vercel:

1. اذهب إلى: https://vercel.com/dashboard
2. اختر المشروع: `banda-chao`
3. Settings → Environment Variables
4. أضف/حدّث:

```bash
# Backend API
NEXT_PUBLIC_API_URL=https://banda-chao.onrender.com/api/v1

# Socket.io
NEXT_PUBLIC_SOCKET_URL=https://banda-chao.onrender.com

# Backend Base (اختياري)
NEXT_PUBLIC_BACKEND_URL=https://banda-chao.onrender.com
```

#### ب) إذا كان Frontend على Render:

1. اذهب إلى: https://dashboard.render.com
2. اختر Frontend Service
3. Environment → Add Environment Variable:

```bash
NEXT_PUBLIC_API_URL=https://banda-chao.onrender.com/api/v1
NEXT_PUBLIC_SOCKET_URL=https://banda-chao.onrender.com
NEXT_PUBLIC_BACKEND_URL=https://banda-chao.onrender.com
```

### 3. 🔄 إعادة النشر (Redeploy)

#### أ) Render:
- بعد تحديث Environment Variables، Render سيُعيد النشر تلقائياً
- انتظر حتى يكتمل البناء (Build)

#### ب) Vercel:
1. Deployments → اختر آخر deployment
2. انقر على "Redeploy"
3. انتظر حتى يكتمل البناء

### 4. 🧪 التحقق من الإعداد

#### أ) Backend Health Check:
```bash
curl https://banda-chao.onrender.com/api/health
```

**النتيجة المتوقعة:**
```json
{
  "status": "ok",
  "message": "Banda Chao Server is running",
  "timestamp": "2025-01-XX..."
}
```

#### ب) AI Service Health Check:
```bash
curl https://banda-chao.onrender.com/api/v1/ai/health
```

**النتيجة المتوقعة:**
```json
{
  "status": "ok",
  "service": "AI Assistant",
  "apiKeyConfigured": true,
  "apiKeyLength": 39,
  "model": "gemini-1.5-flash",
  "message": "AI service is ready",
  "timestamp": "2025-01-XX..."
}
```

#### ج) Frontend Test:
1. افتح الموقع: `https://banda-chao-frontend.onrender.com` أو `https://banda-chao.vercel.app`
2. اضغط F12 → Network
3. جرّب تسجيل الدخول أو تصفح المنتجات
4. تحقق من أن الطلبات تذهب إلى:
   - ✅ `https://banda-chao.onrender.com/api/v1/...`
   - ❌ **ليس**: `https://banda-chao-backend.onrender.com/...`
   - ❌ **ليس**: `http://localhost:3001/...`

### 5. 🧹 Clear Cache

بعد Redeploy:

#### أ) Browser Cache:
- **Hard Reload**: `Ctrl+Shift+R` (Windows) أو `Cmd+Shift+R` (Mac)
- أو: DevTools → Network → "Disable cache" + Reload

#### ب) CDN Cache (إذا كان موجود):
- Vercel: Cache يُمسح تلقائياً بعد deployment جديد
- Render: Cache يُمسح تلقائياً

### 6. 🎯 اختبار Founder Console

1. اذهب إلى: `/founder/assistant`
2. اختر "باندا المؤسس"
3. أرسل رسالة: "مرحباً"
4. يجب أن تحصل على رد من الباندا ✅

### 7. 🔍 استكشاف الأخطاء

#### أ) إذا كان AI لا يعمل:
```bash
# تحقق من GEMINI_API_KEY في Backend
curl https://banda-chao.onrender.com/api/v1/ai/health
```

#### ب) إذا كان Socket.io لا يعمل:
- افتح Browser Console
- ابحث عن أخطاء WebSocket
- تأكد من أن الاتصال إلى: `wss://banda-chao.onrender.com/socket.io/...`

#### ج) إذا كانت API calls تفشل:
- تحقق من Network tab في DevTools
- تأكد من أن الطلبات تذهب إلى URL الصحيح
- تحقق من CORS headers

## الملخص

✅ **Backend**: `https://banda-chao.onrender.com`
✅ **Frontend**: `https://banda-chao-frontend.onrender.com` أو `https://banda-chao.vercel.app`
✅ **API**: `https://banda-chao.onrender.com/api/v1`
✅ **Socket**: `wss://banda-chao.onrender.com/socket.io`

❌ **تجنب**: `banda-chao-backend.onrender.com` (قديم/خاطئ)
❌ **تجنب**: `localhost:3001` (محلي فقط)

---

**بعد تطبيق هذه الخطوات، يجب أن يعمل كل شيء بشكل مثالي!** 🚀
