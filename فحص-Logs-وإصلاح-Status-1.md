# 🔍 فحص Logs وإصلاح Status 1

**المشكلة:** Deploy فشل مع "Exited with status 1" ❌

---

## 📋 **الخطوات:**

### **الخطوة 1: فحص Logs في Render**

1. في Render Dashboard، اضغط على **"Logs"** في القائمة الجانبية
2. ابحث عن آخر Deploy
3. **انسخ Logs الكاملة** (خاصة الأخطاء)
4. **أرسلها لي** وسأساعدك في إصلاحها

---

### **الخطوة 2: المشاكل المحتملة**

#### **المشكلة 1: Prisma Error**
**السبب:** Prisma schema خطأ أو DATABASE_URL خاطئ  
**الحل:** تحقق من Prisma schema و DATABASE_URL

#### **المشكلة 2: TypeScript Error**
**السبب:** أخطاء في TypeScript  
**الحل:** تحقق من tsconfig.json و TypeScript errors

#### **المشكلة 3: Dependencies Error**
**السبب:** dependencies مفقودة أو متضاربة  
**الحل:** تحقق من package.json

---

### **الخطوة 3: التحقق من Build Command**

في Render Dashboard → Settings:

**Build Command يجب أن يكون:**
```
npm install --legacy-peer-deps && npx prisma generate && npm run build
```

---

### **الخطوة 4: التحقق من Environment Variables**

في Render Dashboard → Environment:

تحقق من وجود:
- ✅ `DATABASE_URL` (مهم جداً!)
- ✅ `JWT_SECRET`
- ✅ `JWT_EXPIRES_IN` = `7d`
- ✅ `NODE_ENV` = `production`
- ✅ `FRONTEND_URL`
- ✅ `SEED_SECRET` = `banda-chao-secret-2025`

---

## 🔍 **كيفية نسخ Logs:**

1. اضغط على **"Logs"** في Render
2. **انسخ** جميع السطور التي تحتوي على:
   - `Error`
   - `Failed`
   - `npm ERR`
   - `prisma`
   - `TypeScript`
3. **أرسلها لي**

---

## 🆘 **إذا لم تستطع نسخ Logs:**

### **الحل البديل: فحص الكود محلياً**

جرب Build محلياً:

```bash
cd server
npm install --legacy-peer-deps
npx prisma generate
npm run build
```

إذا فشل Build محلياً، **انسخ الخطأ** وأرسله لي.

---

## ✅ **بعد إصلاح المشكلة:**

### **1. تحقق من Health:**
```bash
curl https://banda-chao-backend.onrender.com/api/health
```

### **2. شغّل Seed:**
```bash
curl -X POST https://banda-chao-backend.onrender.com/api/v1/seed \
  -H "Content-Type: application/json" \
  -d '{"secret": "banda-chao-secret-2025"}'
```

---

**📅 تاريخ:** اليوم  
**✍️ الحالة:** ⚠️ **يحتاج فحص Logs**

