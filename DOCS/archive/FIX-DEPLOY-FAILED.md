# ⚠️ إصلاح Deploy Failed

## ❌ **المشكلة:**

- ❌ **Deploy فشل** على Render
- ❌ **Logs غير متاحة** بسبب فشل Deploy
- ❌ **يجب معرفة سبب الفشل**

---

## 🔍 **الخطوة 1: فحص Events**

### **في Render Dashboard:**

1. **اضغط "Events"** (في القائمة الجانبية)
2. **ابحث عن:** آخر Deploy فاشل
3. **اقرأ:** رسالة الخطأ

---

## 🔍 **الخطوة 2: فحص الأخطاء الشائعة**

### **أخطاء محتملة:**

#### **1. Build Error:**
- ❌ **Prisma schema not found**
- ❌ **npm install failed**
- ❌ **TypeScript compilation error**

#### **2. Start Error:**
- ❌ **Port already in use**
- ❌ **Database connection failed**
- ❌ **Missing environment variables**

#### **3. Runtime Error:**
- ❌ **Module not found**
- ❌ **Syntax error**
- ❌ **Database migration failed**

---

## 🔧 **الحلول:**

---

### **الحل 1: تحقق من Settings**

#### **في Render Dashboard:**

1. **Settings** (في القائمة الجانبية)
2. **تحقق من:**

   - ✅ **Root Directory:** `server`
   - ✅ **Build Command:** `npm install && npx prisma generate && npm run build`
   - ✅ **Start Command:** `npm start`
   - ✅ **Environment Variables:** جميعها موجودة

---

### **الحل 2: تحقق من Environment Variables**

#### **في Render Dashboard:**

1. **Environment** (في القائمة الجانبية)
2. **تحقق من:**

   - ✅ `DATABASE_URL` موجود وصحيح
   - ✅ `JWT_SECRET` موجود
   - ✅ `JWT_EXPIRES_IN` = `7d`
   - ✅ `NODE_ENV` = `production`
   - ✅ `FRONTEND_URL` موجود

---

### **الحل 3: تحقق من Build Command**

#### **إذا كان الخطأ في Prisma:**

**Build Command يجب أن يكون:**
```bash
npm install && npx prisma generate && npm run build
```

**أو مع schema path:**
```bash
npm install && npx prisma generate --schema=./prisma/schema.prisma && npm run build
```

---

### **الحل 4: Manual Deploy**

#### **في Render Dashboard:**

1. **Settings** → **Manual Deploy**
2. **اضغط "Deploy latest commit"**
3. **راقب** Build progress

---

## 📋 **خطوات الإصلاح:**

```
1️⃣  Events → اقرأ رسالة الخطأ
2️⃣  Settings → تحقق من Root Directory, Build Command, Start Command
3️⃣  Environment → تحقق من جميع Variables
4️⃣  إذا كان الخطأ في Prisma → أضف --schema=./prisma/schema.prisma
5️⃣  Manual Deploy → Deploy latest commit
6️⃣  راقب Build progress
```

---

## 🔍 **أخطاء شائعة وحلولها:**

### **1. "prisma/schema.prisma: file not found"**

**الحل:**
- ✅ تحقق من `Root Directory` = `server`
- ✅ Build Command يجب أن يكون: `npm install && npx prisma generate && npm run build`

---

### **2. "Database connection failed"**

**الحل:**
- ✅ تحقق من `DATABASE_URL` في Environment Variables
- ✅ استخدم `Internal Database URL` (ليس External)

---

### **3. "Module not found"**

**الحل:**
- ✅ تحقق من `package.json` في `server/`
- ✅ تأكد من أن جميع dependencies موجودة

---

### **4. "Port already in use"**

**الحل:**
- ✅ Render يستخدم PORT تلقائياً، لا حاجة لتعيينه في Environment Variables
- ✅ تحقق من `server/src/index.ts` يستخدم `process.env.PORT || 3001`

---

## ✅ **بعد الإصلاح:**

1. **Manual Deploy** → **Deploy latest commit**
2. **راقب** Build و Deploy progress
3. **انتظر** حتى "Deploy succeeded"
4. **اختبر** Backend URL: `https://banda-chao-backend.onrender.com/api/health`

---

**اذهب إلى Events واقرأ رسالة الخطأ!** 🔍
