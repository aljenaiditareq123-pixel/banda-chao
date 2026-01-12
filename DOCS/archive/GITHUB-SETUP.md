# 🚀 إعداد GitHub للنشر

## ✅ Git جاهز!

تم تهيئة Git بنجاح في المشروع.

---

## 📋 الخطوات التالية:

### 1️⃣ إنشاء مستودع على GitHub

1. اذهب إلى: **https://github.com**
2. سجّل بحسابك (أو أنشئ حساب جديد)
3. اضغط **"+"** → **"New repository"**
4. **اسم المستودع:** `banda-chao`
5. **الوصف:** (اختياري) "Banda Chao - Social E-commerce Platform"
6. **الظهور:** Public أو Private (كما تفضل)
7. ❌ **لا تضع علامة** على "Add README" أو "Add .gitignore"
8. اضغط **"Create repository"**

---

### 2️⃣ ربط المشروع بـ GitHub

بعد إنشاء المستودع، ستظهر لك تعليمات. استخدم الأوامر التالية:

```bash
# تأكد أنك في مجلد المشروع
cd /Users/tarqahmdaljnydy/Desktop/banda-chao

# أضف GitHub كـ remote (استبدل USERNAME باسمك)
git remote add origin https://github.com/USERNAME/banda-chao.git

# تحقق من الربط
git remote -v

# ارفع المشروع
git branch -M main
git push -u origin main
```

**ملاحظة:** سيطلب منك اسم المستخدم وكلمة المرور على GitHub.

---

### 3️⃣ ربط GitHub بـ Vercel

1. اذهب إلى: **https://vercel.com**
2. سجّل بحساب GitHub
3. اضغط **"Add New..."** → **"Project"**
4. اضغط **"Import Git Repository"**
5. اختر `banda-chao`
6. اضغط **"Import"**

---

### 4️⃣ إعداد Vercel

#### إعدادات المشروع:
- **Project Name:** `banda-chao`
- **Framework:** Next.js (تلقائي)
- **Root Directory:** `./`

#### متغيرات البيئة (Environment Variables):

**المتغير 1:**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://gtnyspavjsoolvnphihs.supabase.co`
- ✅ اضبط للبيئات: Production, Preview, Development

**المتغير 2:**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bnlzcGF2anNvb2x2bnBoaWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjcxNDAsImV4cCI6MjA3NzMwMzE0MH0.kKpUYPuRdJOBd39S9w_bvb-Zc7w5qyYj07UtLy-V5BU`
- ✅ اضبط للبيئات: Production, Preview, Development

---

### 5️⃣ النشر!

1. اضغط **"Deploy"**
2. انتظر 2-5 دقائق
3. ✅ **احصل على رابط!**

---

## 🎉 بعد النشر:

### ستحصل على رابط مثل:
```
https://banda-chao.vercel.app
```

### الروابط:
```
https://banda-chao.vercel.app/showcase
https://banda-chao.vercel.app/ai/chat
https://banda-chao.vercel.app
```

---

## ✅ المزايا بعد الربط:

- ✅ **نشر تلقائي** عند أي تحديث على GitHub
- ✅ **نسخة احتياطية** من الكود
- ✅ **سهولة التعاون** مع فريق
- ✅ **تاريخ التغييرات** محفوظ

---

## 📝 ملاحظات:

- بعد ربط GitHub، أي `git push` سينشر تلقائياً!
- يمكنك تعديل الكود وإعادة النشر بسهولة
- كل شيء آمن ومحفوظ على GitHub

---

**🚀 ابدأ الآن: https://github.com**


