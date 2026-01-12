# 🔧 كيفية تشغيل Prisma Migrations في Render

**المشكلة:** الجداول غير موجودة في قاعدة البيانات  
**الحل:** تشغيل Prisma Migrations لإنشاء الجداول

---

## 📋 **الخطوات:**

### **الخطوة 1: افتح Render Shell**

1. في Render Dashboard
2. اضغط على **"Shell"** في القائمة الجانبية (تحت قسم MANAGE)
3. سيتم فتح Terminal في المتصفح

---

### **الخطوة 2: شغّل Prisma Migrations**

في Render Shell:

```bash
cd server
npx prisma migrate deploy
```

**النتيجة المتوقعة:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres", schema "public" at "..."

Applying migration `20250101000000_init`
```

---

### **الخطوة 3: التحقق من النجاح**

بعد تشغيل Migrations، يجب أن ترى:
- ✅ `Applied migration`
- ✅ `All migrations have been applied`

---

### **الخطوة 4: شغّل Seed API**

بعد Migrations ناجحة:

```bash
curl -X POST https://banda-chao-backend.onrender.com/api/v1/seed \
  -H "Content-Type: application/json" \
  -d '{"secret": "banda-chao-secret-2025"}'
```

---

## 🔍 **بديل: تشغيل Migrations محلياً**

إذا كان لديك `DATABASE_URL` في `.env` محلياً:

```bash
cd server
npx prisma migrate deploy
```

---

## ⚠️ **ملاحظات مهمة:**

1. **DATABASE_URL:** يجب أن يكون موجوداً في Render Environment Variables
2. **Prisma Client:** يجب أن يكون موجوداً في `node_modules`
3. **Schema:** يجب أن يكون `prisma/schema.prisma` موجوداً

---

## ✅ **بعد Migrations:**

بعد Migrations ناجحة:
- ✅ الجداول ستكون موجودة في قاعدة البيانات
- ✅ Seed API سيعمل بنجاح
- ✅ البيانات ستكون متاحة

---

**📅 تاريخ:** اليوم  
**✍️ الحالة:** ✅ **جاهز - اتبع الخطوات أعلاه**


