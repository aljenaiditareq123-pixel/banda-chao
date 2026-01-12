# 🔍 فتح Deploy Logs لقراءة الخطأ

## ❌ **المشكلة:**

- ❌ **جميع Deploys فشلت**
- ❌ **الرسالة:** "Exited with status 1 while building your code"
- ❌ **يجب فتح Deploy Logs لمعرفة السبب**

---

## 🔍 **الخطوة 1: افتح Deploy Logs**

### **في صفحة Events:**

1. **ابحث عن:** آخر "Deploy failed" (الأحدث)
2. **اضغط على:** **"deploy logs"** (الرابط الأزرق في الوصف)
   - أو **اضغط على Deploy** نفسه لفتح التفاصيل
3. **ستفتح صفحة Logs** مع تفاصيل الخطأ

---

## 📋 **الخطوة 2: اقرأ رسالة الخطأ**

### **في صفحة Logs:**

**ابحث عن:**

- ❌ **"Error:"** أو **"Failed:"**
- ❌ **"Module not found"**
- ❌ **"prisma/schema.prisma: file not found"**
- ❌ **"Database connection failed"**
- ❌ **"npm install failed"**
- ❌ **"TypeScript compilation error"**

---

## 🔧 **الأخطاء الشائعة والحلول:**

---

### **1. "prisma/schema.prisma: file not found"**

**الحل:**

1. **Settings** (في القائمة الجانبية)
2. **Root Directory:** `server`
3. **Build Command:** 
   ```
   npm install && npx prisma generate && npm run build
   ```
4. **Save Changes**

---

### **2. "Module not found"**

**الحل:**

1. **تحقق من:** `server/package.json`
2. **تأكد من:** جميع dependencies موجودة
3. **Build Command:** يجب أن يحتوي على `npm install`

---

### **3. "Database connection failed"**

**الحل:**

1. **Environment** (في القائمة الجانبية)
2. **تحقق من:** `DATABASE_URL`
3. **استخدم:** Internal Database URL (ليس External)

---

### **4. "Service Root Directory ... is missing"**

**الحل:**

1. **Settings** (في القائمة الجانبية)
2. **Root Directory:** `server` (فقط، بدون مسافات)
3. **Build Command:** 
   ```
   npm install && npx prisma generate && npm run build
   ```
4. **Start Command:** 
   ```
   npm start
   ```
5. **Save Changes**

---

## 📋 **الخطوات الكاملة:**

```
1️⃣  Events → اضغط على "deploy logs" في آخر Deploy failed
2️⃣  اقرأ رسالة الخطأ في Logs
3️⃣  إذا كان الخطأ في Prisma → Settings → Root Directory = server
4️⃣  إذا كان الخطأ في Database → Environment → DATABASE_URL
5️⃣  Save Changes
6️⃣  Manual Deploy → Deploy latest commit
```

---

## ✅ **بعد الإصلاح:**

1. **Settings** → تأكد من القيم الصحيحة
2. **Environment** → تأكد من جميع Variables
3. **Manual Deploy** → **Deploy latest commit**
4. **راقب Build progress**

---

## 🎯 **القيم الصحيحة في Settings:**

```
Root Directory: server
Build Command: npm install && npx prisma generate && npm run build
Start Command: npm start
```

---

**اضغط على "deploy logs" واقرأ رسالة الخطأ!** 🔍


