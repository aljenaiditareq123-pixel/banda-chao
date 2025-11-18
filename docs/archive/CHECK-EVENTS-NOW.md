# 🔍 فحص Events لمعرفة سبب فشل Deploy

## ✅ **أنت في صفحة Environment Variables**

---

## 📋 **الخطوة 1: تحقق من Environment Variables**

### **في الصفحة الحالية:**

**تحقق من وجود هذه Variables:**

| Key | يجب أن يكون موجود |
|-----|-------------------|
| `DATABASE_URL` | ✅ |
| `JWT_SECRET` | ✅ |
| `JWT_EXPIRES_IN` | ✅ |
| `NODE_ENV` | ✅ |
| `FRONTEND_URL` | ✅ |

---

## 🔍 **الخطوة 2: اذهب إلى Events**

### **في الشريط الجانبي الأيسر:**

1. **ابحث عن:** **"Events"** (في القائمة الجانبية)
2. **اضغط على:** **"Events"**
3. **ستفتح صفحة Events** مع قائمة Deployments

---

## 📋 **الخطوة 3: اقرأ رسالة الخطأ**

### **في صفحة Events:**

1. **ابحث عن:** آخر Deploy (الأحدث)
2. **تحقق من:** الحالة (Status)
   - ❌ **Failed** = فشل
   - ⏳ **In progress** = قيد التنفيذ
   - ✅ **Live** = نجح

3. **إذا كان Failed:**
   - **اضغط على Deploy** لفتح التفاصيل
   - **اقرأ:** رسالة الخطأ

---

## 🔧 **الأخطاء الشائعة:**

### **1. "Service Root Directory ... is missing"**

**الحل:**
- Settings → Root Directory = `server`

---

### **2. "prisma/schema.prisma: file not found"**

**الحل:**
- Settings → Build Command = `npm install && npx prisma generate && npm run build`

---

### **3. "Database connection failed"**

**الحل:**
- Environment → تحقق من `DATABASE_URL`
- استخدم Internal Database URL

---

### **4. "Module not found"**

**الحل:**
- تحقق من `package.json` في `server/`
- تأكد من أن جميع dependencies موجودة

---

## ✅ **الخطوات السريعة:**

```
1️⃣  تحقق من Environment Variables (في الصفحة الحالية)
2️⃣  Events (في القائمة الجانبية)
3️⃣  اقرأ رسالة الخطأ في آخر Deploy
4️⃣  أصلح المشكلة
5️⃣  Manual Deploy → Deploy latest commit
```

---

## 🎯 **بعد معرفة سبب الخطأ:**

### **إذا كان الخطأ في Settings:**

1. **Settings** (في القائمة الجانبية)
2. **Root Directory:** `server`
3. **Build Command:** `npm install && npx prisma generate && npm run build`
4. **Start Command:** `npm start`
5. **Save Changes**

---

### **إذا كان الخطأ في Environment Variables:**

1. **Environment** (أنت هنا الآن)
2. **أضف Variables المفقودة**
3. **Save, rebuild, and deploy**

---

**اذهب إلى Events واقرأ رسالة الخطأ!** 🔍


