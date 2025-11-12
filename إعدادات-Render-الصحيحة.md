# ✅ إعدادات Render الصحيحة - Backend Service

**الخدمة:** banda-chao-backend  
**النوع:** Web Service  
**البيئة:** Node.js

---

## 📋 **الإعدادات المطلوبة في Render Dashboard:**

### **1. Root Directory (مهم جداً!)**
```
server
```
⚠️ **هذا هو الأهم!** إذا كان فارغاً أو `./`، Render سيحاول بناء Frontend بدلاً من Backend.

---

### **2. Build Command**
```
npm install --legacy-peer-deps && npm run build
```

---

### **3. Start Command**
```
npm start
```

---

### **4. Environment**
```
Node
```

---

### **5. Node Version**
```
18
```
أو `20` (أي إصدار Node.js 18 أو أحدث)

---

## 🔧 **Environment Variables:**

في Render Dashboard → Environment:

| المتغير | القيمة | ملاحظات |
|---------|--------|---------|
| `DATABASE_URL` | `postgresql://...` | رابط قاعدة البيانات PostgreSQL |
| `JWT_SECRET` | `your-secret-key` | مفتاح سري لـ JWT |
| `JWT_EXPIRES_IN` | `7d` | مدة صلاحية JWT |
| `NODE_ENV` | `production` | بيئة التشغيل |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | رابط Frontend |
| `SEED_SECRET` | `banda-chao-secret-2025` | مفتاح سري لـ Seed API |

---

## 📝 **الخطوات:**

### **الخطوة 1: افتح Settings**
1. في Render Dashboard
2. اضغط على **"Settings"** في القائمة الجانبية

### **الخطوة 2: تحقق من Root Directory**
1. ابحث عن **"Root Directory"** أو **"Root Dir"**
2. **تأكد** من أن القيمة هي `server`
3. إذا كانت فارغة أو `./`، **غيّرها** إلى `server`

### **الخطوة 3: تحقق من Build Command**
1. ابحث عن **"Build Command"**
2. **تأكد** من أن Build Command هو:
   ```
   npm install --legacy-peer-deps && npm run build
   ```

### **الخطوة 4: تحقق من Start Command**
1. ابحث عن **"Start Command"**
2. **تأكد** من أن Start Command هو:
   ```
   npm start
   ```

### **الخطوة 5: احفظ التغييرات**
1. اضغط على **"Save Changes"** أو **"Update"**
2. Render سيبدأ Deploy تلقائياً

---

## ✅ **التحقق من Deploy ناجح:**

بعد Deploy، في Logs يجب أن ترى:
- ✅ `npm install` (بدون Next.js)
- ✅ `prisma generate`
- ✅ `tsc` (TypeScript compilation)
- ✅ `Server is running on http://localhost:PORT`

---

## 🆘 **إذا استمرت المشكلة:**

1. **تحقق من Root Directory مرة أخرى**
2. **انسخ Logs** من Render
3. **أرسلها لي** وسأساعدك في إصلاحها

---

**📅 تاريخ:** اليوم  
**✍️ الحالة:** ✅ **جاهز - يحتاج تحديث Settings في Render Dashboard**


