# 🤖 استخدم هذا Script - كل شيء تلقائي!

## 🎯 **الخطوات البسيطة (3 خطوات فقط):**

### **الخطوة 1: تثبيت Vercel CLI (مرة واحدة فقط)**

**في Terminal، اكتب:**

```bash
npm install -g vercel
```

**ثم:**

```bash
vercel login
```

**سيطلب منك:**
- ✅ **افتح المتصفح** واذهب إلى الرابط
- ✅ **اضغط "Authorize"**

---

### **الخطوة 2: احصل على Backend URL من Render**

**1. اذهب إلى Render Dashboard:**
   ```
   https://dashboard.render.com
   ```

**2. اذهب إلى Web Service "banda-chao-backend"**

**3. انسخ URL** (مثل: `https://banda-chao-backend.onrender.com`)

---

### **الخطوة 3: شغل Script**

**في Terminal، اكتب:**

```bash
cd /Users/tarqahmdaljnydy/Desktop/banda-chao
./setup-vercel-env-auto.sh
```

**Script سيسألك:**
- ✅ **Backend URL** - الصق URL الذي نسخته
- ✅ **هل تريد Redeploy؟** - اكتب `y` ثم Enter

**Script سيفعل كل شيء تلقائياً!**

---

## ✅ **ما الذي سيفعله Script:**

1. ✅ **يتحقق من Vercel CLI** (يُثبته إذا لم يكن موجوداً)
2. ✅ **يتحقق من Login** (يطلب Login إذا لم تكن مسجلاً)
3. ✅ **يسألك Backend URL** (نسخه ولصقه فقط)
4. ✅ **يضيف Environment Variables تلقائياً** (3 environments: production, preview, development)
5. ✅ **يبدأ Redeploy تلقائياً** (إذا أردت)

---

## 🎯 **الخلاصة:**

**الخطوات:**
1. ✅ **تثبيت Vercel CLI:** `npm install -g vercel` (مرة واحدة فقط)
2. ✅ **Login:** `vercel login` (مرة واحدة فقط)
3. ✅ **احصل على Backend URL** من Render (نسخه)
4. ✅ **شغل Script:** `./setup-vercel-env-auto.sh`
5. ✅ **الصق Backend URL** عندما يُطلب منك
6. ✅ **اكتب `y`** للـ Redeploy

**الوقت:** ~3-5 دقائق

---

## 🚀 **ابدأ الآن:**

**1. في Terminal، اكتب:**

```bash
npm install -g vercel
vercel login
```

**2. بعد Login، اذهب إلى Render واحصل على Backend URL**

**3. شغل Script:**

```bash
./setup-vercel-env-auto.sh
```

**4. الصق Backend URL واكتب `y` للـ Redeploy**

---

**كل شيء تلقائي الآن!** 🚀

