# ⏱️ حل مشكلة Deploy Timeout

**المشكلة:** Deploy فشل مع "Timed out" ⏱️

---

## 📋 **السبب:**

Build Command يستغرق وقتاً طويلاً جداً (أكثر من 10 دقائق).

---

## 🔧 **الحل:**

### **الخطوة 1: تحديث Build Command في Render**

في Render Dashboard → Settings:

**Build Command (الجديد - أسرع):**
```
npm ci --legacy-peer-deps && npx prisma generate && npm run build
```

**الفرق:**
- `npm ci` أسرع من `npm install`
- `--legacy-peer-deps` يمنع مشاكل dependencies

---

### **الخطوة 2: التحقق من الإعدادات الأخرى**

#### **Start Command:**
```
npm start
```

#### **Root Directory:**
```
server
```

---

### **الخطوة 3: إعادة Deploy**

1. اضغط على **"Manual Deploy"** في أعلى الصفحة
2. اختر **"Deploy latest commit"**
3. انتظر حتى يكتمل (5-10 دقائق)

---

## ⚠️ **إذا استمر Timeout:**

### **الحل البديل: تبسيط Build Command**

إذا استمر Timeout، استخدم Build Command أبسط:

```
npm install --legacy-peer-deps && npx prisma generate && npm run build
```

---

## 🔍 **التحقق من Logs:**

1. اضغط على **"Logs"** في Render
2. ابحث عن آخر Deploy
3. تحقق من:
   - هل `npm install` اكتمل؟
   - هل `prisma generate` اكتمل؟
   - هل `npm run build` اكتمل؟
   - أين توقف بالضبط؟

---

## ✅ **بعد Deploy ناجح:**

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

## 🆘 **إذا استمرت المشكلة:**

1. **انسخ Logs** من Render
2. **أرسلها لي** وسأساعدك في إصلاحها

---

**📅 تاريخ:** اليوم  
**✍️ الحالة:** ⚠️ **يحتاج إصلاح**


