# طريقة سريعة لإنشاء Storage Bucket

## 🎯 الطريقة الأسهل (يدوية - 5 دقائق)

### 1. افتح Supabase Dashboard:
https://supabase.com/dashboard → اختر مشروعك

### 2. اذهب إلى Storage:
القائمة الجانبية → **Storage**

### 3. اضغط "New bucket"

### 4. املأ البيانات:
- **Name:** `avatars`
- **Public bucket:** ✅ ON
- **File size limit:** `5`
- **Allowed MIME types:** `image/*`

### 5. اضغط "Create bucket"

### 6. إعداد Policies:

#### Policy 1 (للقراءة):
- اضغط على bucket `avatars`
- Policies → New Policy
- Name: `Public Read`
- Operation: `SELECT`
- Roles: `anon`, `authenticated`
- Using: `true`

#### Policy 2 (للرفع):
- Policies → New Policy
- Name: `Authenticated Upload`
- Operation: `INSERT`
- Roles: `authenticated`
- Using: `auth.role() = 'authenticated'`
- Check: `auth.role() = 'authenticated'`

---

## ✅ انتهيت!

الآن يمكنك رفع الصور الشخصية في المشروع.

