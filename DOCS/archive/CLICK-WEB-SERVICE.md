# 🚀 اضغط على New Web Service الآن!

## ✅ **أنت في Render Dashboard - ممتاز!**

ترى 6 خيارات:
- Static Sites
- **Web Services** ← هذا ما نحتاجه!
- Private Services
- Background Workers
- Cron Jobs
- Postgres

---

## 🎯 **الخطوة الآن:**

### **1. اضغط على "New Web Service"**

- في البطاقة الثانية
- العنوان: "Dynamic web app"
- الوصف: "Ideal for full-stack apps, API servers, and mobile backends"
- اضغط الرابط الأرجواني: **"New Web Service"**

---

### **2. بعد الضغط:**

ستفتح صفحة جديدة:

**سيناريو 1: Connect Repository**
- سيطلب منك **"Connect GitHub Repository"**
- اضغط **"Connect"** أو **"Authorize GitHub"**
- بعد التصريح، ستظهر قائمة Repositories
- ابحث عن **"banda-chao"** واخترها

**سيناريو 2: Select Repository مباشرة**
- ستظهر قائمة Repositories مباشرة
- ابحث عن **"banda-chao"**
- اخترها

---

### **3. Configure Service:**

بعد اختيار Repository:

**Basic Settings:**
- **Name:** `banda-chao-backend`
- **Root Directory:** `server` ← مهم جداً!

**Build & Deploy:**
- **Build Command:** 
  ```
  npm install && npx prisma generate && npm run build
  ```
- **Start Command:**
  ```
  npm start
  ```

**Environment Variables:**
- اضغط **"Add Environment Variable"**
- أضف:
  - `JWT_SECRET = bn80kDLXizc3ivodUtXrD9tO2WTL3IDfBk+WfFKDeSk=`
  - `JWT_EXPIRES_IN = 7d`
  - `FRONTEND_URL = https://banda-chao.vercel.app`
  - `NODE_ENV = production`

**Note:** `DATABASE_URL` سنضيفه لاحقاً من PostgreSQL

---

### **4. Create Web Service**

- اضغط **"Create Web Service"** في الأسفل
- سيبدأ النشر! 🚀

---

**اضغط الآن على "New Web Service"!** 🚀


