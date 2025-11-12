# 🚀 دليل سريع - حل المشاكل

## 📋 **العناوين السريعة:**

---

### **1. Database - إضافة DATABASE_URL**

**📍 المكان:** Render Dashboard → Service → Settings → Environment

**🔧 الحل:**
1. Database `banda-chao-db` → Settings → Copy Internal Database URL
2. Service → Environment → Add: `DATABASE_URL` = (الصق URL)

---

### **2. Service لا يعمل - فحص Logs**

**📍 المكان:** Render Dashboard → Service → Logs

**🔧 الحل:**
1. اقرأ آخر Logs
2. حدد الخطأ
3. حل المشكلة
4. Manual Deploy

---

### **3. Build فشل - فحص Build Command**

**📍 المكان:** Render Dashboard → Service → Settings → Build & Deploy

**🔧 الحل:**
- Root Directory: `server`
- Build Command: `npm install && npx prisma generate && npm run build`
- Start Command: `npm start`

---

### **4. Prisma - تشغيل Migrations**

**📍 المكان:** Render Dashboard → Service → Shell

**🔧 الحل:**
```bash
npx prisma migrate deploy
```

---

## 🎯 **من أين تبدأ:**

### **الخطوة 1: افتح Render Dashboard**

```
dashboard.render.com
```

### **الخطوة 2: ابحث عن Service**

```
Dashboard → banda-chao-backend
```

### **الخطوة 3: اذهب إلى Logs**

```
Service → Logs (في الـ Sidebar)
```

---

## ✅ **الحلول السريعة:**

### **المشكلة: Service لا يعمل**

**الحل:**
1. Logs → اقرأ الخطأ
2. Environment → تأكد من DATABASE_URL
3. Manual Deploy

### **المشكلة: Database غير متصل**

**الحل:**
1. Database → Settings → Copy Internal URL
2. Service → Environment → Add DATABASE_URL

### **المشكلة: Build فشل**

**الحل:**
1. Settings → Build & Deploy
2. تأكد من القيم الصحيحة
3. Manual Deploy

---

**ابدأ من Logs أولاً!** 🔍


