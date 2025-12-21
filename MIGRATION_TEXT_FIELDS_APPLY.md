# 🔄 تطبيق Migration لحقول TEXT في جدول Products

## المشكلة
خطأ "Server Components render" عند حفظ منتج برابط صورة Amazon طويل جداً.

## الحل المطبق

### 1. Schema Changes
تم تحديث `prisma/schema.prisma` لتحويل الحقول التالية إلى `@db.Text`:
- `description`, `description_ar`, `description_zh`
- `image_url`, `external_link`, `video_url`

### 2. Migration SQL
تم إنشاء ملف migration:
- `prisma/migrations/20251221_extend_text_fields_for_products/migration.sql`

### 3. تطبيق Migration على Render

**الطريقة التلقائية (موصى بها):**

سيتم تطبيق التغييرات تلقائياً عند البناء التالي على Render عبر `postbuild` script الذي ينفذ:
```bash
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss
```

**الطريقة اليدوية (إذا لزم الأمر):**

في Render Shell (Backend service):
```bash
cd server
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss
```

أو استخدام Migration SQL مباشرة:
```bash
cd server
psql "$DATABASE_URL" -f ../prisma/migrations/20251221_extend_text_fields_for_products/migration.sql
```

### 4. التحقق من النجاح

بعد تطبيق Migration، تحقق من:
```sql
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name IN ('description', 'description_ar', 'description_zh', 'image_url', 'external_link', 'video_url');
```

يجب أن تكون `data_type` = `text` (بدون حد أقصى للطول).

## ملاحظات

- `prisma db push` سيطبق التغييرات من schema.prisma مباشرة
- Migration SQL موجود كمرجع إذا احتجت تطبيقه يدوياً
- Truncation logic في Server Action كحل احتياطي
