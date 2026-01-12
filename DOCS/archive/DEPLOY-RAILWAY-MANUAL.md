# 🚀 نشر Backend على Railway - خطوة بخطوة

## ⚠️ **Railway يحتاج تسجيل دخول تفاعلي**

---

## 📝 **الخطوات:**

### **1. تسجيل الدخول:**

افتح Terminal واكتب:
```bash
cd server
railway login
```

سيطلب منك:
- سيفتح المتصفح تلقائياً
- أو يعطيك رابط للتسجيل
- أكمل التسجيل في المتصفح

---

### **2. إنشاء مشروع:**

```bash
railway init
```

اختر:
- **Create a new project** (إنشاء مشروع جديد)
- **Name:** `banda-chao-backend`

---

### **3. إضافة PostgreSQL:**

```bash
railway add postgresql
```

سيضيف قاعدة بيانات تلقائياً ويضيف `DATABASE_URL` في Environment Variables.

---

### **4. إعداد Environment Variables:**

```bash
# إنشاء JWT Secret قوي
JWT_SECRET=$(openssl rand -base64 32)

# إضافة المتغيرات
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set JWT_EXPIRES_IN="7d"
railway variables set FRONTEND_URL="https://banda-chao.vercel.app"
railway variables set NODE_ENV="production"
```

---

### **5. تشغيل Migration:**

```bash
railway run npx prisma migrate deploy
railway run npx prisma generate
```

---

### **6. النشر:**

```bash
railway up
```

---

### **7. الحصول على URL:**

```bash
railway domain
```

انسخ URL وأضفه في Vercel!

---

## 🎯 **بديل أسهل: Render**

إذا كنت تفضل طريقة أسهل، استخدم Render:
1. اذهب إلى: https://render.com
2. تسجيل الدخول
3. New → Web Service
4. اتبع: `DEPLOY-BACKEND-NOW.md`

---

**جاهز! ابدأ بخطوة 1!** 🚀


