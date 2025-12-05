# 🔄 دليل تطبيق Prisma Migrations على Render

## المشكلة
خطأ: `column "password" of relation "users" does not exist`

هذا يعني أن قاعدة البيانات على Render غير محدثة ولا تحتوي على عمود `password` في جدول `users`.

---

## ✅ الحل السريع

### الطريقة 1: استخدام السكريبت الشامل (موصى به)

في Render Shell:

```bash
cd /opt/render/project/src/server
bash scripts/render-fix-database.sh
```

هذا السكريبت سيقوم بـ:
1. توليد Prisma Client
2. دفع schema إلى قاعدة البيانات (إضافة عمود password)
3. إنشاء المستخدم تلقائياً

---

### الطريقة 2: خطوة بخطوة

```bash
# 1. الانتقال إلى مجلد server
cd /opt/render/project/src/server

# 2. توليد Prisma Client
npx prisma generate --schema=./prisma/schema.prisma

# 3. دفع schema إلى قاعدة البيانات
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss

# 4. التحقق من أن عمود password موجود
psql "$DATABASE_URL" -c "\d users" | grep password

# 5. إنشاء المستخدم
npx ts-node scripts/render-create-user.ts
```

---

## 🔍 التحقق من النتيجة

بعد تشغيل السكريبت:

```bash
# التحقق من عمود password
psql "$DATABASE_URL" -c "\d users"

# يجب أن ترى:
# password | text | not null

# التحقق من المستخدم
psql "$DATABASE_URL" -c "SELECT id, email, name, role FROM users WHERE email = 'aljenaiditareq123@gmail.com';"
```

---

## 📋 ما يحدث في postbuild

عند كل نشر على Render، يتم تشغيل:

```bash
npx prisma migrate deploy
```

أو إذا فشل:

```bash
npx prisma db push --accept-data-loss
```

هذا يضمن أن قاعدة البيانات محدثة دائماً.

---

## ⚠️ ملاحظات مهمة

1. **`db push` vs `migrate deploy`**:
   - `migrate deploy`: يطبق migrations موجودة (يحتاج migrations/)
   - `db push`: يدفع schema مباشرة (لا يحتاج migrations/)

2. **`--accept-data-loss`**:
   - يسمح بحذف الأعمدة/الجداول غير الموجودة في schema
   - آمن في الإنتاج إذا كنت متأكداً من schema

3. **بعد إصلاح قاعدة البيانات**:
   - يجب أن يعمل تسجيل الدخول
   - يمكنك إنشاء مستخدمين جدد

---

## 🐛 إذا استمرت المشكلة

1. **تحقق من DATABASE_URL**:
   ```bash
   echo "$DATABASE_URL" | sed 's/:[^:@]*@/:****@/g'
   ```

2. **تحقق من Prisma Client**:
   ```bash
   npx prisma --version
   ```

3. **تحقق من Schema**:
   ```bash
   cat prisma/schema.prisma | grep -A 5 "model users"
   ```

---

**آخر تحديث**: بعد إضافة سكريبتات migration لـ Render



