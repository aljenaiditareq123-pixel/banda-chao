# 📦 إعداد Storage Buckets في Supabase

## 📋 الهدف:
إنشاء Buckets منفصلة لتنظيم الملفات بشكل أفضل:
- `avatars` - الصور الشخصية (موجود بالفعل)
- `videos` - الفيديوهات
- `thumbnails` - صور الفيديوهات المصغرة
- `products` - صور المنتجات

---

## 🔧 الخطوات:

### 1. إنشاء Bucket للفيديوهات

1. **افتح Supabase Dashboard**
   - اذهب إلى: https://supabase.com/dashboard
   - اختر مشروعك

2. **Storage → Create New Bucket**
   - اضغط "Storage" من القائمة الجانبية
   - اضغط "New bucket"
   - **الاسم:** `videos`
   - **Public:** ✅ نعم (Public bucket)
   - اضغط "Create bucket"

3. **إضافة Policy للرفع:**
   - اضغط على bucket `videos`
   - اضغط "Policies" tab
   - اضغط "New policy"
   - اختر "Get started quickly"
   - اختر: **"Enable insert access to authenticated users only"**
   - اضغط "Use this template"
   - اضغط "Review" ثم "Save policy"

4. **إضافة Policy للمشاهدة:**
   - اضغط "New policy" مرة أخرى
   - اختر "Get started quickly"
   - اختر: **"Enable read access to everyone"**
   - اضغط "Use this template"
   - اضغط "Review" ثم "Save policy"

---

### 2. إنشاء Bucket للـ Thumbnails

1. **Create New Bucket:**
   - **الاسم:** `thumbnails`
   - **Public:** ✅ نعم
   - اضغط "Create bucket"

2. **إضافة نفس الـ Policies:**
   - Policy 1: "Enable insert access to authenticated users only"
   - Policy 2: "Enable read access to everyone"

---

### 3. إنشاء Bucket لصور المنتجات

1. **Create New Bucket:**
   - **الاسم:** `products`
   - **Public:** ✅ نعم
   - اضغط "Create bucket"

2. **إضافة نفس الـ Policies:**
   - Policy 1: "Enable insert access to authenticated users only"
   - Policy 2: "Enable read access to everyone"

---

## ✅ بعد الإنشاء:

### تحديث الكود:

1. **ملف `app/videos/new/page.tsx`:**
   - غيّر `from('avatars')` → `from('videos')` للفيديوهات
   - غيّر `from('avatars')` → `from('thumbnails')` للـ thumbnails

2. **ملف `app/products/new/page.tsx`:**
   - غيّر `from('avatars')` → `from('products')` لصور المنتجات

---

## 📝 ملاحظات:

- ✅ Bucket `avatars` موجود بالفعل ويستخدم للصور الشخصية
- ⚠️ حالياً الكود يستخدم `avatars` لكل شيء (يعمل لكن غير مثالي)
- ✅ بعد إنشاء Buckets الجديدة، يجب تحديث الكود

---

## 🎯 الخطوات التالية بعد الإنشاء:

1. ✅ إنشاء Buckets
2. ✅ إضافة Policies
3. ⚠️ تحديث الكود لاستخدام Buckets الجديدة

**ملاحظة:** الكود الحالي يعمل مع `avatars` لكن يُفضل استخدام Buckets منفصلة لتنظيم أفضل.

