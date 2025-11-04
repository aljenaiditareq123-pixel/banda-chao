# ⚠️ Deployment فشل - الحل السريع

## ❌ **المشكلة:**

- ❌ **"Logs are unavailable because a recent deploy failed"**
- ❌ Deployment فشل!

---

## 🔍 **الخطوة 1: اذهب إلى Events**

### **في الـ Sidebar الأيسر:**

1. **اضغط "Events"** (في الأعلى، بجانب "Settings")
2. **ستجد أحدث Deployment**
3. **اقرأ الخطأ**

---

## 📋 **الخطوة 2: اقرأ الخطأ**

### **في صفحة Events:**

**ستجد:**
- أحدث Deployment (Failed)
- رسالة الخطأ
- Logs التفصيلية

---

## 🔧 **الحلول الشائعة:**

---

### **الحل 1: DATABASE_URL مفقود**

#### **إذا كان الخطأ متعلق بـ Database:**

1. **Database `banda-chao-db`** → **Settings**
2. **Copy Internal Database URL**
3. **Service** → **Environment** → **Add:**
   ```
   DATABASE_URL = (الصق Internal URL)
   ```
4. **Manual Deploy**

---

### **الحل 2: Build Command خاطئ**

#### **إذا كان الخطأ متعلق بـ Build:**

1. **Settings** → **Build & Deploy**
2. **تأكد من:**
   ```
   Root Directory: server
   Build Command: npm install && npx prisma generate && npm run build
   Start Command: npm start
   ```
3. **Save Changes**
4. **Manual Deploy**

---

### **الحل 3: Prisma Schema غير موجود**

#### **إذا كان الخطأ: "prisma/schema.prisma not found":**

1. **تأكد من:**
   - `server/prisma/schema.prisma` موجود في GitHub
   - تم Push إلى GitHub

2. **Manual Deploy**

---

### **الحل 4: Environment Variables مفقودة**

#### **إذا كان الخطأ متعلق بـ Environment:**

1. **Settings** → **Environment**
2. **تأكد من وجود:**
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `NODE_ENV`
3. **Manual Deploy**

---

## 📋 **خطوات سريعة:**

```
1️⃣  Sidebar → Events (اضغط هنا!)
2️⃣  اقرأ آخر Deployment → الخطأ
3️⃣  حدد المشكلة
4️⃣  حل المشكلة
5️⃣  Manual Deploy
```

---

## ✅ **بعد الإصلاح:**

### **ستحصل على:**

- ✅ Build ناجح
- ✅ Service يعمل
- ✅ Logs متاحة

---

**اضغط "Events" في الـ Sidebar واقرأ الخطأ!** 🔍

