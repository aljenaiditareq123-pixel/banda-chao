# دليل إعداد قاعدة البيانات - Database Setup Guide

## الخطوات المطلوبة

### 1. إعداد ملف `.env`

أنشئ ملف `.env` في جذر المشروع وأضف:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/banda_chao?schema=public"
```

**للحصول على قاعدة بيانات سحابية مجانية:**

#### Option 1: Neon (موصى به)
1. اذهب إلى [neon.tech](https://neon.tech)
2. أنشئ حساب مجاني
3. أنشئ مشروع جديد
4. انسخ `Connection String`
5. ضعه في `.env` كـ `DATABASE_URL`

#### Option 2: Supabase
1. اذهب إلى [supabase.com](https://supabase.com)
2. أنشئ مشروع جديد
3. اذهب إلى Settings > Database
4. انسخ `Connection String`
5. ضعه في `.env` كـ `DATABASE_URL`

#### Option 3: Render PostgreSQL
1. اذهب إلى [render.com](https://render.com)
2. أنشئ PostgreSQL Database جديد
3. انسخ `Internal Database URL`
4. ضعه في `.env` كـ `DATABASE_URL`

### 2. تشغيل Migration

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data
npm run db:seed
```

### 3. التحقق من البيانات

```bash
# Open Prisma Studio to view data
npx prisma studio
```

## بيانات الدخول الافتراضية (من Seed)

- **Admin**: `admin@bandachao.com` / `admin123`
- **Founder**: `founder@bandachao.com` / `founder123`

## قواعد التسعير المضافة (من Seed)

1. **NEW_CUSTOMER_DISCOUNT**: خصم 10% للعملاء الجدد (أكثر من $50)
2. **SEASONAL_SALE_FASHION**: خصم 15% موسمي للأزياء
3. **BULK_PURCHASE_DISCOUNT**: خصم 5% للكميات الكبيرة (5+ قطع، $200+)
4. **FLASH_SALE_ELECTRONICS**: خصم 20% عروض فلاش للإلكترونيات

## اختبار الخازن

تم إنشاء ملف اختبار في `scripts/test-treasurer.ts`:

```bash
npx tsx scripts/test-treasurer.ts
```

**النتيجة المتوقعة:**
- منتج سعره $100 + مستخدم جديد = $90 (خصم 10%)
- ✅ جميع الاختبارات نجحت!

## ملاحظات

- إذا كنت تستخدم SQLite للتطوير المحلي، غير `provider` في `schema.prisma` إلى `sqlite`
- تأكد من أن قاعدة البيانات فارغة قبل تشغيل `db push`
- Seed script آمن - يمكن تشغيله عدة مرات (idempotent)
