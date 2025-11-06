# 🔧 إصلاح مشكلة Next.js في Backend

**المشكلة:** Render يحاول تشغيل Next.js (Frontend) بدلاً من Backend ❌

**الخطأ:**
```
Error: Could not find a production build in the '.next' directory.
Try building your app with 'next build' before starting the production server.
```

---

## 🔍 **السبب:**

Render يحاول تشغيل `next start` بدلاً من `node dist/index.js`. هذا يعني أن:
- Root Directory غير مضبوط على `server`
- أو أن هناك Frontend service منفصل يحاول Render تشغيله

---

## 🔧 **الحل:**

### **الخطوة 1: تحقق من Service Name**

في Render Dashboard:

1. تأكد من أنك في **Backend service** (اسمه `banda-chao-backend`)
2. **ليس** Frontend service (اسمه `banda-chao`)

---

### **الخطوة 2: تحقق من Root Directory**

في Render Dashboard → Settings:

1. ابحث عن **"Root Directory"**
2. تأكد من أن القيمة هي `server` (بدون `/` في النهاية)
3. إذا كانت فارغة أو خاطئة:
   - احذف كل شيء
   - اكتب: `server`
   - **احفظ** التغييرات

---

### **الخطوة 3: تحقق من Build Command**

في Render Dashboard → Settings:

**Build Command يجب أن يكون:**
```
npm install --legacy-peer-deps && npm run build
```

**لا يجب أن يكون:**
- ❌ `next build`
- ❌ `npm run build` (بدون Root Directory = server)

---

### **الخطوة 4: تحقق من Start Command**

في Render Dashboard → Settings:

**Start Command يجب أن يكون:**
```
npm start
```

**لا يجب أن يكون:**
- ❌ `next start`
- ❌ `npm run start`

---

### **الخطوة 5: أعد Deploy**

بعد التحقق من الإعدادات:

1. في Render Dashboard
2. اضغط على **"Manual Deploy"** → **"Deploy latest commit"**
3. انتظر 5-10 دقائق

---

## ✅ **الإعدادات الصحيحة للـ Backend:**

| الإعداد | القيمة الصحيحة |
|---------|----------------|
| **Service Name** | `banda-chao-backend` |
| **Root Directory** | `server` |
| **Build Command** | `npm install --legacy-peer-deps && npm run build` |
| **Start Command** | `npm start` |
| **Environment** | `Node` |

---

## 🔍 **كيفية التحقق:**

بعد Deploy ناجح، في Logs يجب أن ترى:
- ✅ `npm install` (بدون Next.js)
- ✅ `prisma generate`
- ✅ `tsc` (TypeScript compilation)
- ✅ `Server is running on http://localhost:PORT`
- ✅ `WebSocket server is ready`

**لا يجب أن ترى:**
- ❌ `next start`
- ❌ `Next.js`
- ❌ `.next directory`

---

## ⚠️ **ملاحظات مهمة:**

1. **Service Name:** تأكد من أنك في Backend service (`banda-chao-backend`)
2. **Root Directory:** مهم جداً - يجب أن يكون `server`
3. **Build Command:** يجب أن يكون لـ Backend (TypeScript build)
4. **Start Command:** يجب أن يكون `npm start` (يستدعي `node dist/index.js`)

---

## 🆘 **إذا استمرت المشكلة:**

1. **تحقق من Service Name** - تأكد من أنك في Backend service
2. **تحقق من Root Directory** - يجب أن يكون `server`
3. **انسخ Logs** من Render
4. **أرسلها لي** وسأساعدك في إصلاحها

---

**📅 تاريخ:** اليوم  
**✍️ الحالة:** ⚠️ **يحتاج التحقق من Root Directory و Service Name**

