# 🔍 تشخيص مشكلة 404 في Backend API

**تاريخ:** 28 ديسمبر 2025

---

## ⚠️ المشكلة:

من Logs Frontend، أرى:

```
[productsAPI.getAll] Error: Error [AxiosError]: Request failed with status code 404
Error fetching public services: Error [AxiosError]: Request failed with status code 404
```

**هذا يعني:**
- Frontend يحاول استدعاء Backend API
- Backend API يعيد 404 (Route not found)
- المشكلة في Backend Service

---

## 🔍 السبب المحتمل:

### **1. Backend Service غير متاح (Sleeping أو Down)**

### **2. Backend Service لم يبدأ بشكل صحيح**

### **3. URL Backend API غير صحيح**

---

## ✅ الحل:

### **الخطوة 1: تحقق من Backend Service Status**

1. Render Dashboard
2. ابحث عن **`banda-chao-backend`** (Backend Service)
3. تحقق من الحالة:
   - ✅ **"Live"** أو **"Active"** → يعمل
   - ⚠️ **"Sleeping"** → في Sleep Mode (يستغرق وقت للاستيقاظ)
   - ❌ **"Stopped"** → متوقف

---

### **الخطوة 2: اختبار Backend Health مباشرة**

افتح في المتصفح:
```
https://banda-chao-backend.onrender.com/api/health
```

**النتائج المحتملة:**

#### ✅ **إذا رأيت "OK":**
- Backend Service يعمل ✅
- المشكلة قد تكون في Frontend Environment Variables

#### ❌ **إذا رأيت 404 أو خطأ:**
- Backend Service غير متاح أو لم يبدأ بشكل صحيح
- يجب فحص Backend Logs

#### ⚠️ **إذا رأيت "Request timeout":**
- Backend Service في Sleep Mode
- انتظر 30-60 ثانية ثم جرّب مرة أخرى

---

### **الخطوة 3: فحص Backend Logs**

1. Render Dashboard → **`banda-chao-backend`**
2. اضغط **"Logs"**
3. ابحث عن:

#### ✅ **إذا رأيت:**
```
🚀 Server is running on 0.0.0.0:10000
[JWT_SECRET] ✅ JWT_SECRET is loaded successfully
[ENV CHECK] ✅ All required environment variables are set
```
→ Backend يعمل بشكل صحيح ✅

#### ❌ **إذا رأيت أخطاء:**
- ابحث عن خطأ في Startup
- تحقق من `[JWT_SECRET]` messages

---

### **الخطوة 4: تحقق من Frontend Environment Variables**

1. Render Dashboard → **`banda-chao-frontend`**
2. اضغط **"Environment"**
3. ابحث عن: **`NEXT_PUBLIC_API_URL`**
4. **يجب أن يكون:**
   ```
   https://banda-chao-backend.onrender.com
   ```
   (بدون `/api/v1` في النهاية)

---

## 📋 Checklist:

- [ ] ✅ فتح Render Dashboard
- [ ] ✅ البحث عن **`banda-chao-backend`** (Backend Service)
- [ ] ✅ التحقق من الحالة (Live/Sleeping/Stopped)
- [ ] ✅ اختبار Backend Health: `https://banda-chao-backend.onrender.com/api/health`
- [ ] ✅ فتح Backend Logs
- [ ] ✅ البحث عن `[JWT_SECRET]` messages
- [ ] ✅ البحث عن `🚀 Server is running`
- [ ] ✅ فتح Frontend Environment Variables
- [ ] ✅ التحقق من `NEXT_PUBLIC_API_URL`

---

## 🎯 الخطوات التالية حسب النتيجة:

### **أ) إذا كان Backend Service "Sleeping":**

1. انتظر 30-60 ثانية (Backend يستيقظ تلقائياً عند أول طلب)
2. أو اضغط **"Restart"** لإيقاظه فوراً
3. جرّب Login مرة أخرى

---

### **ب) إذا كان Backend Service "Stopped" أو غير موجود:**

1. يجب إنشاء Backend Service في Render
2. أو Restart Backend Service

---

### **ج) إذا كان Backend Health يعيد "OK" لكن Frontend لا يزال يحصل على 404:**

1. تحقق من `NEXT_PUBLIC_API_URL` في Frontend Environment Variables
2. تأكد أنه: `https://banda-chao-backend.onrender.com`
3. Restart Frontend Service بعد تحديث Environment Variables

---

**🚀 ابدأ باختبار Backend Health: `https://banda-chao-backend.onrender.com/api/health`** ✅
