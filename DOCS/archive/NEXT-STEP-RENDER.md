# 🎯 الخطوة التالية في Render - الآن!

## 📝 **ما تراه الآن:**

في صفحة "New Web Service":
- **"No repositories found"** ← هذا طبيعي!
- زر **"GitHub"** كبير

---

## ✅ **الخطوة الآن:**

### **1. اضغط على زر "GitHub"**

- سيأخذك لصفحة GitHub
- سيطلب منك **"Authorize Render"**
- اضغط **"Authorize renderinc"**

---

### **2. بعد التصريح:**

- سترجع تلقائياً لـ Render
- ستظهر قائمة **Repositories**
- ابحث عن: `banda-chao` أو اسم المشروع لديك
- **اختره**

---

### **3. Configure Service:**

بعد اختيار Repository، املأ:

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

---

### **4. Environment Variables:**

اضغط **"Add Environment Variable"** وأضف:

```
JWT_SECRET = bn80kDLXizc3ivodUtXrD9tO2WTL3IDfBk+WfFKDeSk=
JWT_EXPIRES_IN = 7d
FRONTEND_URL = https://banda-chao.vercel.app
NODE_ENV = production
```

**(DATABASE_URL سنضيفه لاحقاً من PostgreSQL)**

---

### **5. Create Web Service**

- اضغط **"Create Web Service"** في الأسفل
- سيبدأ النشر! 🚀

---

## ⚠️ **مهم:**

- **Root Directory** يجب أن يكون: `server`
- **Build Command** يجب أن يشمل: `npx prisma generate`

---

**الآن اضغط على زر "GitHub" واستمر!** 🚀


