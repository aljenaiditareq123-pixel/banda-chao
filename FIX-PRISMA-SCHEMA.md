# ⚠️ Build فشل: prisma.schema not found - الحل

## ❌ **الخطأ:**

```
prisma/schema.prisma: file not found
schema.prisma: file not found
```

---

## 🔍 **السبب:**

Prisma لا يجد ملف `schema.prisma` في المكان المتوقع.

---

## 🔧 **الحل:**

### **الخطوة 1: تحقق من Root Directory**

#### **في Settings → Build & Deploy:**

1. **Root Directory** يجب أن يكون: **`server`**
2. إذا كان خاطئاً:
   - Edit → اكتب: **`server`** → Save

---

### **الخطوة 2: تحقق من Build Command**

#### **في Settings → Build & Deploy:**

**Build Command** يجب أن يكون:
```
npm install && npx prisma generate && npm run build
```

**⚠️ مهم:** يجب أن يحتوي على `npx prisma generate`

---

### **الخطوة 3: تحقق من أن الملف موجود في Git**

#### **إذا كان الملف غير موجود في GitHub:**

1. **Commit الملف:**
   - في GitHub Desktop أو Terminal
   - `git add server/prisma/schema.prisma`
   - `git commit -m "Add prisma schema"`
   - `git push origin main`

2. **Render سيأخذ الملف من GitHub**

---

### **الخطوة 4: بديل - تحديث Build Command**

#### **إذا استمر الفشل:**

**Build Command** مع path صريح:
```
npm install && cd server && npx prisma generate && npm run build
```

**⚠️ لكن هذا يعني Root Directory يجب أن يكون فارغ!**

---

## ✅ **الحل الصحيح:**

### **1. Root Directory:**
```
server
```

### **2. Build Command:**
```
npm install && npx prisma generate && npm run build
```

### **3. Start Command:**
```
npm start
```

### **4. تأكد أن `server/prisma/schema.prisma` موجود في GitHub**

---

## 📋 **خطوات التحقق:**

1. ✅ **Settings** → Root Directory = `server`
2. ✅ **Build Command** = `npm install && npx prisma generate && npm run build`
3. ✅ **Start Command** = `npm start`
4. ✅ **Git:** تأكد أن `server/prisma/schema.prisma` موجود في GitHub
5. ✅ **Save Changes**
6. ✅ **Redeploy**

---

## 🚀 **إذا استمر الفشل:**

### **تحقق من Logs:**

- في Render Dashboard → **"Logs"**
- ابحث عن الخطأ الكامل
- قد يكون الملف في مكان آخر

---

**اذهب إلى Settings وتحقق من Root Directory و Build Command!** 🔧

