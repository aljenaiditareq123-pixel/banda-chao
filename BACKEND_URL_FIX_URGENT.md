# 🔥 إصلاح عاجل: Backend URL الخاطئ

## المشكلة المكتشفة

Frontend يتصل بـ Backend URL خاطئ/قديم:

❌ **URL الخاطئ**: `https://banda-chao-backend.onrender.com`
✅ **URL الصحيح**: `https://banda-chao.onrender.com`

## الدليل

1. **Health Check يعمل** على: `https://banda-chao.onrender.com/api/v1/ai/health`
   - يعيد: `apiKeyConfigured: true`, `status: "ok"`

2. **Frontend يحاول الاتصال** بـ: `https://banda-chao-backend.onrender.com/api/v1/ai/assistant`
   - يعيد: `500 - GEMINI_API_KEY environment variable is not set`

3. **WebSocket errors**: `ws://localhost:3001/socket.io` (محاولة الاتصال محلياً في الإنتاج)

## الحل الفوري

### 1. ✅ تحديث Environment Variables في Vercel (Frontend)

**اذهب إلى:**
- Vercel Dashboard: https://vercel.com/dashboard
- اختر المشروع: `banda-chao` (أو اسم المشروع)
- اذهب إلى: **Settings** → **Environment Variables**

**تحقق من/أضف:**

#### `NEXT_PUBLIC_API_URL`
```
https://banda-chao.onrender.com/api/v1
```
⚠️ **ليس**: `https://banda-chao-backend.onrender.com/api/v1`

#### `NEXT_PUBLIC_SOCKET_URL` (اختياري لكن مُوصى به)
```
https://banda-chao.onrender.com
```
⚠️ **ليس**: `https://banda-chao-backend.onrender.com`

#### `NEXT_PUBLIC_BACKEND_URL` (إذا كان موجود)
```
https://banda-chao.onrender.com
```
⚠️ **ليس**: `https://banda-chao-backend.onrender.com`

### 2. ✅ Redeploy Frontend

بعد تحديث Environment Variables:

1. في Vercel Dashboard → **Deployments**
2. انقر على **"Redeploy"** للـ deployment الحالي
   - أو: **"Create Deployment"** → **"Redeploy"**
3. انتظر حتى ينتهي الـ build

### 3. ✅ Clear Browser Cache

بعد الـ Redeploy:

1. افتح الموقع: `https://banda-chao-frontend.onrender.com`
2. اضغط: `Ctrl+Shift+R` (Windows/Linux) أو `Cmd+Shift+R` (Mac)
   - هذا يعمل **Hard Reload** ويمسح الـ cache
3. أو:
   - افتح DevTools (F12)
   - اضغط بزر الماوس الأيمن على زر Refresh
   - اختر **"Empty Cache and Hard Reload"**

### 4. ✅ التحقق

بعد الـ Redeploy و Clear Cache:

#### أ) افتح Browser Console (F12) → Network
- ابحث عن طلبات إلى `/api/v1/ai/assistant`
- يجب أن يكون الـ Request URL:
  ```
  https://banda-chao.onrender.com/api/v1/ai/assistant
  ```
  ❌ **وليس**: `https://banda-chao-backend.onrender.com/...`

#### ب) ابحث عن WebSocket connections
- يجب أن تكون إلى:
  ```
  wss://banda-chao.onrender.com/socket.io/...
  ```
  ❌ **وليس**: `ws://localhost:3001/...`

#### ج) جرّب Assistant
- اذهب إلى `/founder/assistant`
- اختر "باندا المؤسس"
- أرسل رسالة
- يجب أن تحصل على رد ✅

## إذا كان Frontend مستضاف على Render (وليس Vercel)

### Render Dashboard:

1. اذهب إلى: https://dashboard.render.com
2. اختر الخدمة: **Frontend service** (مثل `banda-chao-frontend`)
3. اذهب إلى: **Environment**
4. حدّث القيم:
   - `NEXT_PUBLIC_API_URL` = `https://banda-chao.onrender.com/api/v1`
   - `NEXT_PUBLIC_SOCKET_URL` = `https://banda-chao.onrender.com`
5. **Render سيُعيد التشغيل تلقائياً** بعد الحفظ

## التغييرات في الكود

✅ **تم تحديث Fallbacks في:**

1. `lib/api-utils.ts`
   - `banda-chao-backend.onrender.com` → `banda-chao.onrender.com`

2. `lib/socket.ts`
   - `banda-chao-backend.onrender.com` → `banda-chao.onrender.com`

3. `lib/api.ts`
   - `banda-chao-backend.onrender.com` → `banda-chao.onrender.com`

4. `lib/product-utils.ts`
   - `banda-chao-backend.onrender.com` → `banda-chao.onrender.com`

⚠️ **لكن**: إذا كان `NEXT_PUBLIC_API_URL` معيّن في Environment Variables (في Vercel/Render)، سيتم استخدامه بدلاً من الـ fallback.

## التحقق من الإعداد الحالي

### أ) في Vercel Dashboard:
1. Settings → Environment Variables
2. ابحث عن `NEXT_PUBLIC_API_URL`
3. تحقق من القيمة:
   - ✅ صحيح: `https://banda-chao.onrender.com/api/v1`
   - ❌ خاطئ: `https://banda-chao-backend.onrender.com/api/v1`

### ب) في Browser Console:
افتح Console واكتب:
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
// أو
console.log('Env:', process.env);
```

⚠️ **ملاحظة**: Environment Variables في Next.js تُدمج أثناء البuild، لذلك يجب عمل Redeploy بعد تحديثها.

## الخطوات التلخيصية

1. ✅ **حدّث Environment Variables** في Vercel/Render
2. ✅ **Redeploy** للـ Frontend
3. ✅ **Clear Browser Cache** (Hard Reload)
4. ✅ **تحقق** من Network requests في Console
5. ✅ **جرّب Assistant** مرة أخرى

## النتيجة المتوقعة

بعد الإصلاح:
- ✅ Frontend يتصل بـ `banda-chao.onrender.com` (الصحيح)
- ✅ Health Check يعمل: `apiKeyConfigured: true`
- ✅ Assistant يعمل بدون أخطاء
- ✅ لا توجد أخطاء WebSocket إلى `localhost:3001`
- ✅ لا توجد أخطاء 500 من backend قديم

---

**🔥 هذا الحل الفوري سيصلح المشكلة تماماً!**

