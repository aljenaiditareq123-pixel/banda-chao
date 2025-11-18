# ⚠️ Build فشل: prisma.schema - الحل النهائي

## ❌ **الخطأ:**

```
prisma/schema.prisma: file not found
```

**✅ الملف موجود محلياً وفي Git** - المشكلة في Render!

---

## 🔧 **الحل:**

### **المشكلة:**

Render لا يجد `prisma/schema.prisma` لأن:
- Root Directory غير صحيح
- أو Build Command لا يشير للمسار الصحيح

---

## 📝 **الحل في Settings:**

### **الخطوة 1: Root Directory**

#### **في Settings → Build & Deploy:**

1. **Root Directory:**
   - يجب أن يكون: **`server`**
   - Render سيكون داخل `server/` بعد ذلك

---

### **الخطوة 2: Build Command (مهم جداً)**

#### **Build Command يجب أن يكون:**

```
npm install && npx prisma generate --schema=./prisma/schema.prisma && npm run build
```

**أو:**

```
npm install && cd prisma && npx prisma generate && cd .. && npm run build
```

**أو الأبسط (إذا Root Directory = server):**

```
npm install && npx prisma generate && npm run build
```

---

### **الخطوة 3: Start Command**

```
npm start
```

---

## ✅ **القيم الصحيحة:**

### **Root Directory:**
```
server
```

### **Build Command:**
```
npm install && npx prisma generate && npm run build
```

**أو إذا فشل:**
```
npm install && npx prisma generate --schema=./prisma/schema.prisma && npm run build
```

### **Start Command:**
```
npm start
```

---

## 🔍 **التحقق:**

### **إذا استمر الفشل:**

1. **تحقق من Logs:**
   - Render Dashboard → **"Logs"**
   - ابحث عن "prisma" في Logs
   - ستجد المسار الذي يبحث فيه Prisma

2. **إذا كان يبحث في:**
   - `schema.prisma` → يجب أن يكون في `prisma/schema.prisma`
   - استخدم: `--schema=./prisma/schema.prisma`

---

## 📋 **خطوات الإصلاح:**

1. ✅ **Settings** → Root Directory = `server`
2. ✅ **Build Command** = `npm install && npx prisma generate && npm run build`
   - إذا فشل: استخدم `--schema=./prisma/schema.prisma`
3. ✅ **Start Command** = `npm start`
4. ✅ **Save Changes**
5. ✅ **Redeploy**

---

## 🚀 **بديل سريع:**

### **إذا لم يعمل:**

**Build Command مع path صريح:**
```
npm install && npx prisma generate --schema=prisma/schema.prisma && npm run build
```

---

**اذهب إلى Settings وأصلح Build Command الآن!** 🔧


