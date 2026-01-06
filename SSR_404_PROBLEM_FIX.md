# 🔧 حل مشكلة 404 في SSR (Server-Side Rendering)
# Fix SSR 404 Problem

**التاريخ:** 2025-01-XX  
**المشكلة:** Frontend SSR يحصل على 404 من Backend APIs

---

## 🔍 تحليل Logs

### ✅ الطلبات تصل إلى Backend:
```
[GET] banda-chao.onrender.com/api/v1/products?limit=8 ✅
[GET] banda-chao.onrender.com/api/v1/services/public?limit=8 ✅
[GET] banda-chao.onrender.com/api/v1/makers?limit=6 ✅
[GET] banda-chao.onrender.com/api/v1/videos?limit=6 ✅
```

**لكن:** جميع الطلبات من `userAgent="axios/1.13.2"` (Frontend SSR) تحصل على `responseBytes=4389` (404 error)

### ❌ المشكلة:
Frontend SSR لا يستطيع الوصول إلى Backend APIs أثناء Server-Side Rendering.

---

## 🎯 السبب المحتمل

### المشكلة: `NEXT_PUBLIC_API_URL` غير موجود في Environment Variables

**عند SSR:** Next.js يحتاج `NEXT_PUBLIC_API_URL` في **server-side environment** (Render).

**النتيجة:** `getApiUrl()` يستخدم fallback قد يكون خاطئ أو يسبب مشاكل.

---

## ✅ الحل

### الخطوة 1: تحقق من Environment Variables في Render

**في Render Dashboard:**
1. اذهب إلى `banda-chao` (Backend service)
2. اضغط **Environment**
3. **تأكد من وجود:**
   ```
   NEXT_PUBLIC_API_URL = https://banda-chao.onrender.com
   ```

**إذا كان غير موجود:**
1. اضغط **+ New**
2. Key: `NEXT_PUBLIC_API_URL`
3. Value: `https://banda-chao.onrender.com`
4. Save Changes

---

### الخطوة 2: إعادة نشر Backend Service

**بعد تحديث Environment Variables:**
1. Render → `banda-chao` → **Manual Deploy**
2. اختر **Deploy latest commit**
3. انتظر حتى يكتمل النشر

---

### الخطوة 3: التحقق من أن Backend يعيد Response صحيح

**اختبر Backend مباشرة:**
```bash
curl https://banda-chao.onrender.com/api/v1/products?limit=8
```

**النتيجة المتوقعة:**
```json
{
  "products": [...],
  "pagination": {...}
}
```

**إذا رأيت 404:**
- المشكلة في Backend routes (تحقق من `server/src/index.ts`)

---

## 🔧 حل إضافي: تحقق من `api-utils.ts`

### المشكلة المحتملة:
`getApiUrl()` قد لا يعمل بشكل صحيح في SSR.

**الحل:**
في `lib/api-utils.ts`، تأكد من أن الكود يدعم SSR:

```typescript
export function getApiUrl(): string {
  // في SSR (server-side), process.env.NEXT_PUBLIC_* متاح
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (envUrl) {
    let baseUrl = envUrl.trim().replace(/\/$/, '');
    baseUrl = baseUrl.replace(/\/api$/, '');
    return `${baseUrl}/api/v1`;
  }
  
  // Fallback للـ SSR
  if (typeof window === 'undefined') {
    // Server-side: استخدام Backend URL مباشرة
    return 'https://banda-chao.onrender.com/api/v1';
  }
  
  // Client-side fallback
  return '/api/v1';
}
```

---

## ✅ Checklist الإصلاح

- [ ] تحققت من `NEXT_PUBLIC_API_URL` في Backend Environment Variables
- [ ] أعدت نشر Backend بعد تحديث Environment Variables
- [ ] اختبرت Backend مباشرة (`curl` أو Browser)
- [ ] تحققت من أن Response صحيح (ليس 404)
- [ ] تحققت من `api-utils.ts` (يدعم SSR)

---

## 🎯 الخلاصة

**السبب:** `NEXT_PUBLIC_API_URL` غير موجود في Render Environment Variables للـ Backend service.

**الحل:** أضف `NEXT_PUBLIC_API_URL = https://banda-chao.onrender.com` في Render Dashboard → `banda-chao` → Environment.

---

**بعد الإصلاح:** Frontend SSR سيعمل بشكل صحيح! ✅





