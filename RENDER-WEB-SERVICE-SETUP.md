# 🚀 إنشاء Web Service على Render - خطوة بخطوة

## 📝 **الخطوات:**

### **1. اختر "New Web Service"**
- في صفحة "Create a new Service"
- اضغط على **"New Web Service →"**

---

### **2. Connect Repository**
- اختر **"Connect account"** أو **"Connect GitHub"**
- سجّل دخول بحساب GitHub
- اختر Repository: `banda-chao` (أو اسم المشروع لديك)
- اضغط **"Connect"**

---

### **3. Configure Service**

**Basic Settings:**
- **Name:** `banda-chao-backend`
- **Region:** اختر أقرب منطقة (Singapore, Frankfurt, etc.)
- **Branch:** `main` (أو `master`)

**Root Directory:**
- **Root Directory:** `server`

**Build & Deploy:**
- **Build Command:** 
  ```
  npm install && npx prisma generate && npm run build
  ```
- **Start Command:**
  ```
  npm start
  ```

---

### **4. Environment Variables**

اضغط **"Add Environment Variable"** وأضف:

**1. DATABASE_URL**
- **Key:** `DATABASE_URL`
- **Value:** (سنحصل عليه من PostgreSQL)

**2. JWT_SECRET**
- **Key:** `JWT_SECRET`
- **Value:** (أنشئ مفتاح قوي)

**3. JWT_EXPIRES_IN**
- **Key:** `JWT_EXPIRES_IN`
- **Value:** `7d`

**4. FRONTEND_URL**
- **Key:** `FRONTEND_URL`
- **Value:** `https://banda-chao.vercel.app`

**5. NODE_ENV**
- **Key:** `NODE_ENV`
- **Value:** `production`

---

### **5. إضافة PostgreSQL Database**

**قبل إنشاء Web Service:**

1. اذهب إلى **"New Postgres →"**
2. **Name:** `banda-chao-db`
3. اضغط **"Create Database"**
4. بعد الإنشاء، اذهب إلى **Info**
5. انسخ **Internal Database URL**
6. أضفه في Web Service كـ `DATABASE_URL`

---

### **6. Create Web Service**

- اضغط **"Create Web Service"**
- سيبدأ النشر تلقائياً! 🚀

---

### **7. انتظر حتى يكتمل النشر**

- سيظهر **"Live"** عندما يكتمل
- انسخ **URL** من الأعلى

---

## ✅ **بعد النشر:**

انسخ Backend URL وأرسله لي، وسأكمل باقي الإعداد! 🎉

---

**أخبرني إذا كنت بحاجة لمساعدة في أي خطوة!** 💪

