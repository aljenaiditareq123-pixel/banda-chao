# 🔧 أوامر Render Shell - حل مشكلة قاعدة البيانات

## الخطوة 1: اختبار الاتصال بقاعدة البيانات

### افتح Render Shell:
1. اذهب إلى: https://dashboard.render.com
2. افتح خدمة **Backend** (banda-chao)
3. اضغط على **"Shell"** في القائمة الجانبية
4. انتظر حتى تفتح الطرفية

### اختبر الاتصال:

```bash
# اختبار 1: الاتصال المباشر
psql "$DATABASE_URL" -c "SELECT 1 as test;"
```

إذا فشل، جرب:

```bash
# اختبار 2: مع SSL مطلوب
PGSSLMODE=require psql "$DATABASE_URL" -c "SELECT 1 as test;"
```

إذا نجح، المشكلة هي SSL. قم بتحديث DATABASE_URL:

```bash
# عرض DATABASE_URL الحالي (مخفي)
echo "$DATABASE_URL" | sed 's/:[^:@]*@/:****@/g'

# إذا لم يكن يحتوي على sslmode=require، أضفه في Render Dashboard
```

---

## الخطوة 2: إنشاء المستخدم

بعد التأكد من أن الاتصال يعمل:

### الطريقة 1: استخدام Node.js Script (موصى به)

```bash
# في Render Shell
cd /opt/render/project/src/server
npx ts-node scripts/render-create-user.ts
```

### الطريقة 2: استخدام SQL مباشر

```bash
# في Render Shell
psql "$DATABASE_URL" << EOF
INSERT INTO users (id, email, password, name, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'aljenaiditareq123@gmail.com',
  crypt('T123q123', gen_salt('bf', 10)),
  'Tareq',
  'USER',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET 
  password = crypt('T123q123', gen_salt('bf', 10)),
  name = 'Tareq',
  updated_at = NOW()
RETURNING id, email, name, role;
EOF
```

**ملاحظة**: إذا لم يعمل `crypt`، استخدم Node.js script بدلاً منه.

---

## الخطوة 3: التحقق من المستخدم

```bash
psql "$DATABASE_URL" -c "SELECT id, email, name, role FROM users WHERE email = 'aljenaiditareq123@gmail.com';"
```

---

## 🔍 تشخيص المشاكل

### إذا فشل psql:

```bash
# تحقق من أن DATABASE_URL موجود
echo "DATABASE_URL is: ${DATABASE_URL:0:50}..."

# تحقق من تثبيت psql
which psql

# إذا لم يكن مثبتاً، استخدم Node.js script بدلاً منه
```

### إذا فشل Node.js script:

```bash
# تحقق من Node.js
node --version

# تحقق من Prisma
npx prisma --version

# تحقق من الاتصال
npx prisma db pull
```

---

## 📋 Checklist

- [ ] Render Shell مفتوح
- [ ] DATABASE_URL موجود في البيئة
- [ ] psql يعمل أو Node.js script يعمل
- [ ] الاتصال بقاعدة البيانات نجح
- [ ] المستخدم تم إنشاؤه/تحديثه
- [ ] تم التحقق من المستخدم

---

## 🚨 إذا استمرت المشاكل

1. **تحقق من PostgreSQL Service**:
   - تأكد أنه نشط في Render Dashboard
   - تحقق من Logs

2. **تحقق من DATABASE_URL**:
   - يجب أن يكون Internal Database URL
   - يجب أن يحتوي على `?ssl=true` أو `?sslmode=require`

3. **تحقق من الصلاحيات**:
   - المستخدم في DATABASE_URL يجب أن يكون له صلاحيات CREATE, INSERT

---

**آخر تحديث**: بعد إضافة سكريبتات Render Shell



