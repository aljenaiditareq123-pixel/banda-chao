# ✅ خطوات إنشاء Service جديد

## ✅ **الوضع:**

- ✅ أنت في صفحة "New Web Service"
- ✅ Source Code: `aljenaiditareq123-pixel / banda-chao` ✅
- ✅ Language: `Node` ✅

---

## 🎯 **الخطوات:**

---

### **الخطوة 1: Name**

#### **في حقل "Name":**

1. **تغيير Name:**
   - **حذف:** `banda-chao`
   - **اكتب:** `banda-chao-backend` أو `anda-chao-backend`
   - (أو استخدم الاقتراح `banda-chao-backend`)

---

### **الخطوة 2: Branch**

#### **في حقل "Branch":**

1. **تأكد من:**
   - **Branch:** `main` أو `master`
   - (يجب أن يكون Branch الرئيسي)

---

### **الخطوة 3: Continue/Create Web Service**

#### **في أسفل الصفحة:**

1. **اضغط "Continue"** أو **"Create Web Service"**
2. Render سيبدأ Setup

---

### **الخطوة 4: Render سيقرأ render.yaml تلقائياً!**

#### **بعد Continue:**

Render **سيكتشف `render.yaml` تلقائياً** ويستخدم:
- ✅ `rootDir: server`
- ✅ `buildCommand: npm install && npx prisma generate && npm run build`
- ✅ `startCommand: npm start`

**⚠️ تأكد:**
- ✅ `render.yaml` موجود على GitHub (في جذر Repository)
- ✅ Branch `main` يحتوي على `render.yaml`

---

### **الخطوة 5: Environment Variables**

#### **بعد إنشاء Service:**

1. **Settings** → **Environment**
2. **أضف Environment Variables:**

   ```
   DATABASE_URL = (من Render Database - سنضيفه لاحقاً)
   JWT_SECRET = my-super-secret-jwt-key-12345-67890
   JWT_EXPIRES_IN = 7d
   NODE_ENV = production
   FRONTEND_URL = (سيتم إضافته لاحقاً)
   ```

---

### **الخطوة 6: Database (اختياري الآن)**

#### **يمكنك إضافة Database لاحقاً:**

1. **Render Dashboard** → **New** → **PostgreSQL**
2. **بعد إنشاء Database:**
   - **Copy Internal Database URL**
   - **Settings** → **Environment** → **أضف `DATABASE_URL`**

---

## ✅ **بعد Create Web Service:**

### **ستحصل على:**

- ✅ Render سيبدأ Build تلقائياً
- ✅ Build يجب أن ينجح! ✅ (لأن render.yaml سيقرأ تلقائياً)
- ✅ Service URL جديد

---

## 📋 **ملخص:**

```
1️⃣  Name: banda-chao-backend
2️⃣  Branch: main
3️⃣  اضغط Continue/Create Web Service
4️⃣  Render سيقرأ render.yaml تلقائياً ✅
5️⃣  Build سيعمل! 🎉
```

---

## 💡 **ملاحظة:**

### **Render سيقرأ render.yaml تلقائياً:**
- ✅ عند إنشاء Service جديد
- ✅ من Branch `main`
- ✅ سيستخدم القيم الصحيحة من البداية

---

**اكتب Name واضغط Continue!** 🚀

