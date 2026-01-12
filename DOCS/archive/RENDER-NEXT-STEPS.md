# ✅ Render Dashboard - أكمل الإعداد

## 📋 **الوضع الحالي:**

- ✅ أنت في صفحة **"New Web Service"**
- ✅ Repository مرئي: `aljenaiditareq123-pixel / banda-chao`

---

## 📝 **الخطوات:**

### **1. اختر Repository:**

#### **اضغط على:**
**"aljenaiditareq123-pixel / banda-chao"**

(يجب أن يصبح محدد أو يظهر بجانبه علامة ✓)

---

### **2. Name (اسم الخدمة):**

#### **في حقل "Name":**
اكتب:
```
banda-chao-backend
```

---

### **3. Project (اختياري):**

- يمكنك تخطيه الآن
- أو اختيار Project إذا كان لديك واحد

---

### **4. Environment (اختياري):**

- يمكنك تخطيه الآن
- سيُستخدم "Production" افتراضياً

---

### **5. Continue / Deploy:**

#### **بعد ملء Name:**
- اضغط **"Continue"** أو **"Create Web Service"**
- أو **"Deploy Web Service"**

---

## ✅ **بعد Continue:**

### **Render سيبدأ:**

1. ✅ سيكتشف `render.yaml` تلقائياً
2. ✅ سيستخدم الإعدادات:
   - Root Directory: `server`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`

3. ⚠️ **قد يفشل Build** لأنه يحتاج Database URL
4. **لا مشكلة** - سنضيف Database و Variables بعدها

---

## 🗄️ **الخطوة التالية (بعد Create Web Service):**

### **Create Database:**

1. Render Dashboard → **"New"** → **"PostgreSQL"**
2. Name: `banda-chao-db`
3. Plan: Free
4. Create Database
5. انسخ **Database URL**

---

### **Add Environment Variables:**

1. Web Service → **"Environment"**
2. Add:
   - `DATABASE_URL`
   - `NODE_ENV` = `production`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN` = `7d`
   - `FRONTEND_URL` = `localhost:3000`

---

## 📋 **ملخص:**

1. ✅ **اختر Repository:** `aljenaiditareq123-pixel / banda-chao`
2. ✅ **Name:** `banda-chao-backend`
3. ✅ **Continue / Deploy**
4. ✅ **Create Database**
5. ✅ **Add Environment Variables**

---

**اضغط على Repository ثم املأ Name واضغط Continue!** 🚀


