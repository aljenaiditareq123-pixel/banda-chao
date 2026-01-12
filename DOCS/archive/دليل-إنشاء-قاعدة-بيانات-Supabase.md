# 📚 دليل إنشاء قاعدة بيانات Supabase - خطوة بخطوة

**الهدف:** إنشاء قاعدة بيانات PostgreSQL على Supabase والحصول على Connection String

---

## 📋 **الخطوات:**

### **الخطوة 1: إنشاء حساب Supabase**

1. اذهب إلى [supabase.com](https://supabase.com)
2. اضغط على **"Start your project"** (الزر الأخضر)
3. سجّل الدخول باستخدام:
   - GitHub
   - Google
   - أو أي طريقة أخرى

---

### **الخطوة 2: إنشاء مشروع جديد**

1. بعد تسجيل الدخول، اضغط على **"New Project"**
2. املأ المعلومات:
   - **Name:** `banda-chao-db` (أو أي اسم تريده)
   - **Database Password:** اختر كلمة مرور قوية (احفظها!)
   - **Region:** اختر أقرب منطقة لك (مثل: `Southeast Asia (Singapore)`)
3. اضغط على **"Create new project"**
4. انتظر 2-3 دقائق حتى يتم إنشاء المشروع

---

### **الخطوة 3: الحصول على Connection String**

1. بعد إنشاء المشروع، اذهب إلى **Settings** (⚙️) في القائمة الجانبية
2. اضغط على **"Database"** من القائمة
3. ابحث عن قسم **"Connection string"** أو **"Connection pooling"**
4. اختر **"URI"** أو **"Connection string"**
5. انسخ **Connection String** (سيبدو هكذا):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

---

### **الخطوة 4: إضافة SSL Mode**

**مهم:** يجب إضافة `?sslmode=require` في نهاية Connection String

**مثال:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

**ملاحظة:** استبدل `[YOUR-PASSWORD]` بكلمة المرور التي اخترتها في الخطوة 2

---

### **الخطوة 5: إضافة DATABASE_URL في Render**

1. في Render Dashboard
2. اضغط على **"Environment"** في القائمة الجانبية
3. اضغط على **"Add Environment Variable"** أو **"+**
4. **Key:** `DATABASE_URL`
5. **Value:** الصق Connection String (مع `?sslmode=require`)
6. **احفظ** التغييرات

---

### **الخطوة 6: أعد تشغيل Backend**

بعد إضافة `DATABASE_URL`:

1. في Render Dashboard
2. اضغط على **"Manual Deploy"** → **"Restart"**
3. أو انتظر حتى يعيد Render تشغيل الخدمة تلقائياً

---

### **الخطوة 7: شغّل Prisma Migrations**

بعد إضافة `DATABASE_URL` وإعادة التشغيل:

**في Render Shell:**
1. اضغط على **"Shell"** في Render Dashboard
2. شغّل:
   ```bash
   cd server
   npx prisma migrate deploy
   ```

**أو محلياً (إذا كان لديك DATABASE_URL في `.env`):**
```bash
cd server
npx prisma migrate deploy
```

---

### **الخطوة 8: شغّل Seed API**

بعد إضافة `DATABASE_URL` وإعادة التشغيل:

```bash
curl -X POST https://banda-chao-backend.onrender.com/api/v1/seed \
  -H "Content-Type: application/json" \
  -d '{"secret": "banda-chao-secret-2025"}'
```

---

## ✅ **ملخص الخطوات:**

1. ✅ أنشئ حساب Supabase
2. ✅ أنشئ مشروع جديد
3. ✅ احصل على Connection String
4. ✅ أضف `?sslmode=require` في النهاية
5. ✅ أضف `DATABASE_URL` في Render Environment Variables
6. ✅ احفظ التغييرات
7. ✅ أعد تشغيل Backend
8. ✅ شغّل Prisma Migrations
9. ✅ شغّل Seed API

---

## 🔍 **كيفية العثور على Connection String في Supabase:**

### **الطريقة 1: من Settings → Database**
1. Settings (⚙️) → Database
2. Connection string → URI
3. انسخ PostgreSQL URL

### **الطريقة 2: من Project Settings**
1. Project Settings → Database
2. Connection string
3. انسخ PostgreSQL URL

---

## ⚠️ **ملاحظات مهمة:**

1. **Password:** احفظ كلمة المرور التي اخترتها - ستحتاجها في Connection String
2. **SSL Mode:** مهم جداً - أضف `?sslmode=require` في النهاية
3. **Security:** لا تشارك Connection String مع أي شخص
4. **Free Tier:** Supabase يوفر 500MB مجاناً - كافٍ للمشروع

---

## 🆘 **إذا واجهت مشاكل:**

### **المشكلة 1: Connection String لا يعمل**
- تأكد من إضافة `?sslmode=require`
- تأكد من استبدال `[YOUR-PASSWORD]` بكلمة المرور الصحيحة

### **المشكلة 2: Prisma Migrations فشل**
- تأكد من أن `DATABASE_URL` صحيح
- تأكد من إعادة تشغيل Backend بعد إضافة `DATABASE_URL`

### **المشكلة 3: Seed API فشل**
- تأكد من أن `DATABASE_URL` و `SEED_SECRET` موجودان
- تأكد من إعادة تشغيل Backend

---

**📅 تاريخ:** اليوم  
**✍️ الحالة:** ✅ **جاهز - اتبع الخطوات أعلاه**


