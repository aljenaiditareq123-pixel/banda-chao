# 🗄️ دليل تفعيل قاعدة البيانات - Database Migration Guide

**التاريخ:** 14 ديسمبر 2024  
**الحالة:** ⚠️ يحتاج إعداد `DATABASE_URL`

---

## 📋 الخطوات المطلوبة

### 1. إعداد DATABASE_URL

#### للتطوير المحلي:
أنشئ ملف `.env` في جذر المشروع:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/banda_chao?schema=public"
```

#### للإنتاج (Render):
- ✅ `DATABASE_URL` موجود تلقائياً في Environment Variables
- ✅ Render يقوم بـ `prisma db push` تلقائياً في `postbuild` script

---

### 2. تشغيل Migration

#### للتطوير المحلي:
```bash
cd /Users/tarqahmdaljnydy/Desktop/banda-chao
npx prisma db push
```

#### للإنتاج (Render):
- ✅ **لا حاجة لتدخل يدوي** - Render يقوم بذلك تلقائياً
- ✅ تأكد من أن آخر commit يحتوي على `schema.prisma` المحدث

---

### 3. تشغيل Seeding (بيانات تجريبية)

بعد Migration الناجح:
```bash
npm run db:seed
```

**البيانات التجريبية المضافة:**
- ✅ Flash Drop: منتج تجريبي مع مزاد عكسي نشط
- ✅ Discount Code: `PET2024` (15% خصم، حد أدنى $50)
- ✅ Pet State: حالة حيوان أليف للمستخدم Admin

---

## 🔍 التحقق من النجاح

### 1. فحص الجداول:
```bash
npx prisma studio
```

يجب أن ترى:
- ✅ `pet_states`
- ✅ `pet_feed_history`
- ✅ `discount_codes`
- ✅ `clan_buys`
- ✅ `clan_buy_members`
- ✅ `flash_drops`
- ✅ `flash_drop_participants`
- ✅ `mystery_lists`

### 2. فحص البيانات:
- ✅ Flash Drop نشط في `/flash-drop`
- ✅ Discount Code `PET2024` متاح
- ✅ Pet State موجود للمستخدم Admin

---

## ⚠️ ملاحظات مهمة

1. **Render Deployment:**
   - Render يقوم بـ `prisma db push` تلقائياً في `postbuild`
   - لا حاجة لتدخل يدوي إذا كان `DATABASE_URL` موجود

2. **Local Development:**
   - تحتاج `DATABASE_URL` في `.env`
   - أو استخدم قاعدة بيانات سحابية (Neon, Supabase)

3. **Seeding:**
   - البيانات التجريبية اختيارية
   - يمكن تشغيلها بعد Migration

---

**تم إعداد الدليل بواسطة:** Lead Architect  
**التاريخ:** 14 ديسمبر 2024
