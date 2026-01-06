# 🔍 تشخيص خطأ 400 - Bad Request

**تاريخ:** 2025-01-04  
**المشكلة:** "Request failed with status code 400" عند تسجيل الدخول

---

## 🔍 تحليل المشكلة

خطأ 400 يعني أن الطلب غير صحيح (Bad Request). الأسباب المحتملة:

1. **Validation Error:** البيانات المرسلة لا تمر validation
2. **Wrong Endpoint:** المسار غير صحيح
3. **Missing Headers:** Content-Type أو headers أخرى مفقودة
4. **Proxy Path Issue:** Next.js proxy قد يغير المسار

---

## ✅ الحلول المطبقة

### 1. CSRF تم إصلاحه ✅
- تم تحسين CSRF middleware للتعرف على public endpoints
- تم تغيير `sameSite` إلى 'lax'

### 2. JWT_SECRET تم إصلاحه ✅
- تم إضافة Fallback Value

---

## 🔍 الخطوات التالية للتحقق

### 1. افتح Browser DevTools (F12)
- اذهب إلى تبويب **"Network"**
- جرب تسجيل الدخول
- ابحث عن طلب `/auth/login` أو `/api/v1/auth/login`
- اضغط عليه لرؤية التفاصيل

### 2. تحقق من Request Details:
- **URL:** ما هو المسار الكامل؟
- **Method:** POST
- **Status:** 400
- **Request Payload:** هل يحتوي على `email` و `password`؟
- **Response:** ما هي الرسالة التفصيلية؟

### 3. تحقق من Response:
- افتح Response tab
- ابحث عن:
  - `code: 'VALIDATION_ERROR'`
  - `errors: [...]` (قائمة بأخطاء validation)
  - `message: 'Validation failed'`

---

## 🎯 الأسباب المحتملة

### 1. Validation Error:
إذا كان Response يحتوي على:
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "errors": [...]
}
```
**الحل:** تحقق من:
- Email format صحيح
- Password موجود (لا فارغ)

### 2. Proxy Path Issue:
إذا كان URL مختلف عن المتوقع:
- Frontend يرسل إلى: `/api/proxy/auth/login`
- Backend يتوقع: `/api/v1/auth/login`
- Proxy يجب أن يحول المسار بشكل صحيح

### 3. Content-Type Issue:
إذا كان Content-Type غير صحيح:
- يجب أن يكون: `application/json`
- تحقق من Headers في Network tab

---

## 🔧 الحل السريع

### إذا كان Validation Error:
1. تحقق من أن Email صحيح: `admin@bandachao.com`
2. تحقق من أن Password موجود: `password123`
3. تأكد من عدم وجود مسافات إضافية

### إذا كان Proxy Path Issue:
1. تحقق من `next.config.js` - rewrite rule
2. تحقق من `lib/api-utils.ts` - كيف يتم بناء URL

---

## 📋 Checklist للتحقق

- [ ] فتح Browser DevTools (F12)
- [ ] فتح Network tab
- [ ] جرب تسجيل الدخول
- [ ] ابحث عن request `/auth/login`
- [ ] تحقق من Request Payload
- [ ] تحقق من Response (رسالة الخطأ التفصيلية)
- [ ] أرسل لي التفاصيل

---

**📅 آخر تحديث:** 2025-01-04







