# Banda Chao - إعداد المشروع

## الخطوة 1: إعداد Supabase

### 1. إنشاء مشروع Supabase
1. اذهب إلى [supabase.com](https://supabase.com)
2. أنشئ حساب جديد أو سجل الدخول
3. أنشئ مشروع جديد

### 2. الحصول على مفاتيح API
1. اذهب إلى **Settings** → **API**
2. انسخ:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. إعداد متغيرات البيئة
1. أنشئ ملف `.env.local` في المجلد الرئيسي
2. أضف المفاتيح:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. إنشاء قاعدة البيانات
1. اذهب إلى **SQL Editor** في Supabase
2. افتح ملف `supabase/migrations/001_initial_schema.sql`
3. انسخ المحتوى والصقه في SQL Editor
4. اضغط **Run**

### 5. إعداد Storage Buckets
1. اذهب إلى **Storage** في Supabase
2. أنشئ bucket جديد باسم `avatars`
3. في **Policies**:
   - **Public Access**: ✅ Enabled
   - **File size limit**: 5MB
   - **Allowed MIME types**: image/*

## الخطوة 2: إعداد Google OAuth (اختياري)

### 1. في Supabase Dashboard
1. اذهب إلى **Authentication** → **Providers**
2. فعّل **Google**
3. أضف **Client ID** و **Client Secret** من Google Cloud Console

### 2. في Google Cloud Console
1. أنشئ مشروع جديد
2. فعّل **Google+ API**
3. أنشئ **OAuth 2.0 Client ID**
4. أضف **Authorized redirect URIs**:
   - `https://your-project.supabase.co/auth/v1/callback`

## الخطوة 3: تثبيت التبعيات

```bash
npm install
```

## الخطوة 4: تشغيل المشروع

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

## ملاحظات مهمة

### ✅ ما تم إنجازه:
- ✅ إعداد Supabase (Client & Server)
- ✅ نظام المصادقة (تسجيل/تسجيل دخول + Google)
- ✅ صفحات الملف الشخصي
- ✅ نظام رفع الصور (Supabase Storage)
- ✅ صفحة تفاصيل الفيديو
- ✅ الصفحة الرئيسية مع بيانات حقيقية

### 📝 ما يحتاج إضافته لاحقاً:
- [ ] رفع الفيديوهات (Cloudflare Stream / Bunny.net)
- [ ] نظام التعليقات
- [ ] نظام الإعجابات
- [ ] البحث والفلترة
- [ ] إدارة المنتجات (رفع/تعديل/حذف)
- [ ] نظام الدفع

## استكشاف الأخطاء

### خطأ: "Invalid API key"
- تأكد من إضافة المفاتيح في `.env.local`
- تأكد من إعادة تشغيل السيرفر بعد إضافة المتغيرات

### خطأ: "relation does not exist"
- تأكد من تشغيل ملف SQL migration في Supabase

### خطأ: "Bucket not found"
- تأكد من إنشاء bucket `avatars` في Storage

## دعم إضافي

إذا واجهت أي مشاكل، تحقق من:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
