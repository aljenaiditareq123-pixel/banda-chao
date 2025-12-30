# 🚨 إصلاح عاجل: Frontend يحصل على 404 عند استدعاء Backend API

**تاريخ:** 28 ديسمبر 2025

---

## ⚠️ المشكلة المكتشفة:

من Logs Frontend، أرى أخطاء 404 عند محاولة استدعاء Backend API:

```
[productsAPI.getAll] Error: Error [AxiosError]: Request failed with status code 404
Error fetching public services: Error [AxiosError]: Request failed with status code 404
```

**هذا يعني:**
- ✅ Frontend Service يعمل
- ❌ Backend API غير متاح أو URL غير صحيح
- ❌ Frontend لا يستطيع الوصول لـ Backend

---

## 🔍 السبب المحتمل:

1. **Backend Service غير متاح (Sleep Mode أو Down)**
2. **URL Backend API غير صحيح في Environment Variables**
3. **Backend Service لم يبدأ بشكل صحيح**

---

## ✅ الحل الفوري:

### **1️⃣ تحقق من Backend Service Status:**

1. Render Dashboard
2. ابحث عن **`banda-chao-backend`** (Backend Service)
3. تحقق من الحالة:
   - ✅ **"Live"** أو **"Active"** → Backend يعمل
   - ❌ **"Sleeping"** أو **"Stopped"** → Backend غير متاح

---

### **2️⃣ افتح Backend Logs:**

1. Render Dashboard → **`banda-chao-backend`**
2. اضغط **"Logs"**
3. ابحث عن:
   - `[JWT_SECRET]` messages
   - `🚀 Server is running on 0.0.0.0:10000`
   - أي أخطاء عند Startup

---

### **3️⃣ تحقق من Backend API URL:**

#### **في Frontend Service Environment Variables:**

1. Render Dashboard → **`banda-chao-frontend`**
2. اضغط **"Environment"**
3. ابحث عن: **`NEXT_PUBLIC_API_URL`**
4. **يجب أن يكون:**
   ```
   https://banda-chao-backend.onrender.com
   ```
   (بدون `/api/v1` في النهاية)

---

### **4️⃣ تحقق من Backend Health:**

افتح في المتصفح:
```
https://banda-chao-backend.onrender.com/api/health
```

**يجب أن ترى:** `OK`

**إذا رأيت 404 أو خطأ:**
→ Backend Service غير متاح أو لم يبدأ بشكل صحيح

---

## 📋 Checklist:

- [ ] ✅ فتح Render Dashboard
- [ ] ✅ البحث عن **`banda-chao-backend`** (Backend Service)
- [ ] ✅ التحقق من الحالة (Live/Sleeping/Stopped)
- [ ] ✅ فتح **Backend Logs**
- [ ] ✅ البحث عن `[JWT_SECRET]` messages
- [ ] ✅ البحث عن `🚀 Server is running`
- [ ] ✅ فتح Frontend Environment Variables
- [ ] ✅ التحقق من `NEXT_PUBLIC_API_URL`
- [ ] ✅ اختبار Backend Health: `https://banda-chao-backend.onrender.com/api/health`

---

## 🎯 الخطوات التالية:

### **أ) إذا كان Backend Service "Sleeping":**

1. اضغط **"Restart"** على Backend Service
2. انتظر 30-60 ثانية
3. جرّب Login مرة أخرى

---

### **ب) إذا كان Backend Service "Live" لكن Health Check يفشل:**

1. افتح Backend Logs
2. ابحث عن أخطاء Startup
3. تحقق من `[JWT_SECRET]` messages

---

### **ج) إذا كان `NEXT_PUBLIC_API_URL` غير صحيح:**

1. Frontend Environment → **`NEXT_PUBLIC_API_URL`**
2. قم بتحديثه إلى:
   ```
   https://banda-chao-backend.onrender.com
   ```
3. Save Changes
4. Restart Frontend Service

---

## 🔍 اختبار سريع:

افتح Browser Console (F12) وانسخ:

```javascript
fetch('https://banda-chao-backend.onrender.com/api/health')
  .then(r => r.text())
  .then(d => console.log('Backend Health:', d))
  .catch(e => console.error('Backend not accessible:', e));
```

**إذا رأيت "OK":** → Backend يعمل ✅  
**إذا رأيت خطأ:** → Backend غير متاح ❌

---

**🚀 ابدأ بالتحقق من Backend Service Status الآن!** ✅
