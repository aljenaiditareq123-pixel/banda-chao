# 🔍 خطوات فحص خطأ 500 في `/api/v1/users/me`
# Steps to Debug 500 Error in `/api/v1/users/me`

---

## ✅ ما تم اكتشافه

**من Network Tab:**
- **Request:** `GET https://banda-chao-backend.onrender.com/api/v1/users/me`
- **Status:** `500 Internal Server Error` ❌
- **المشكلة:** Backend يعيد خطأ 500

---

## 🔍 الخطوة 1: رؤية تفاصيل الخطأ (Response)

### في Network Tab:

1. **تأكد أن:** Request `me` محدد (highlighted) ✅
2. **اضغط على:** "الاستجابة" (Response) tab
3. **انسخ:** محتوى Response (الخطأ الكامل)

**مثال على ما يجب نسخه:**
```json
{
  "error": "Internal server error"
}
```

---

## 🔍 الخطوة 2: تحقق من Backend Health

### افتح في المتصفح:

```
https://banda-chao-backend.onrender.com/api/health
```

**إذا كان `OK`:**
- ✅ Backend يعمل
- ❌ لكن `/api/v1/users/me` لديه مشكلة

**إذا كان خطأ:**
- ❌ Backend متوقف أو لديه مشكلة عامة

---

## 🔍 الخطوة 3: تحقق من Headers

### في Network Tab:

1. **اضغط على:** "العناوين" (Headers) tab
2. **ابحث عن:** "Authorization" header
3. **تأكد أن:** Token موجود

**إذا لم يكن موجود:**
- المشكلة في Authentication

---

## 🎯 الأسباب المحتملة

### 1. مشكلة في Database:
- Prisma connection فشل
- User غير موجود في Database

### 2. مشكلة في JWT Token:
- Token غير صحيح
- Token منتهي الصلاحية

### 3. مشكلة في Code:
- `req.userId` هو `undefined`
- Database query فشل

---

## 📋 ما يجب نسخه

### من Response Tab:

**انسخ:**
- **Status Code:** `500`
- **Response Body:** (الخطأ الكامل)

**مثال:**
```json
{
  "error": "Internal server error"
}
```

---

## 🎯 الخطوات السريعة

1. ✅ **في Network Tab:**
   - Request `me` محدد (تم ✅)
   
2. ⏳ **اضغط على:** "الاستجابة" (Response) tab
   
3. ⏳ **انسخ:** محتوى Response (الخطأ الكامل)
   
4. ⏳ **تحقق من:** Backend health (`/api/health`)
   
5. ⏳ **أرسل لي:** Response + Health status

---

## 💡 تحليل الكود

**من `server/src/api/users.ts`:**
- Endpoint يستخدم `authenticateToken` middleware ✅
- يستخدم `prisma.$queryRaw` لاستعلام Database
- إذا فشل، يعيد `500 Internal Server Error`

**المشكلة المحتملة:**
- Database connection issue
- `req.userId` هو `undefined` (لكن middleware يضبطه)
- Prisma query فشل

---

**اضغط على "الاستجابة" (Response) tab وانسخ الخطأ! 🔍**

