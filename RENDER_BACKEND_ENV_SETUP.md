# 🔧 إعداد متغيرات البيئة للـ Backend على Render

## ⚠️ المشكلة الحالية
TestSprite يعيد **500 Internal Server Error** عند محاولة التسجيل. السبب المحتمل: مشكلة في اتصال قاعدة البيانات.

---

## 📋 متغيرات البيئة المطلوبة للـ Backend Service

### 1. **DATABASE_URL** (مطلوب - الأهم!)

#### التنسيق الصحيح لـ Render PostgreSQL:
```
postgresql://username:password@hostname:port/database?ssl=true
```

#### مثال:
```
postgresql://banda_chao_user:your_password@dpg-xxxxx-a.render.com:5432/banda_chao_db?ssl=true
```

#### ⚠️ ملاحظات مهمة:
- **يجب إضافة `?ssl=true`** في نهاية الـ URL
- Render PostgreSQL **يتطلب SSL** في الإنتاج
- الكود يضيف `ssl=true` تلقائياً إذا كان الـ URL يحتوي على `render.com`، لكن من الأفضل إضافته يدوياً

#### كيفية الحصول على DATABASE_URL:
1. اذهب إلى Render Dashboard
2. افتح قاعدة البيانات `banda-chao-db`
3. في قسم **"Connections"** أو **"Info"**
4. انسخ **"Internal Database URL"** أو **"External Database URL"**
5. تأكد من إضافة `?ssl=true` في النهاية

---

### 2. **JWT_SECRET** (مطلوب)

#### التنسيق:
```
any-random-secure-string-at-least-32-characters-long
```

#### مثال:
```
banda-chao-jwt-secret-key-2024-production-secure-random-string
```

#### كيفية إنشائه:
```bash
# في Terminal
openssl rand -base64 32
```

---

### 3. **FRONTEND_URL** (مطلوب)

#### القيمة:
```
https://banda-chao-frontend.onrender.com
```

---

### 4. **NODE_ENV** (مطلوب)

#### القيمة:
```
production
```

---

### 5. **GEMINI_API_KEY** (اختياري - للـ AI features)

#### التنسيق:
```
your-gemini-api-key-from-google-cloud
```

---

## 🔍 كيفية إضافة متغيرات البيئة على Render

### الخطوات:
1. اذهب إلى **Render Dashboard**
2. افتح الـ **Web Service** المسمى `banda-chao-backend`
3. اذهب إلى **"Environment"** في القائمة الجانبية
4. أضف كل متغير بيئة:
   - اضغط **"Add Environment Variable"**
   - أدخل **Key** (مثلاً: `DATABASE_URL`)
   - أدخل **Value** (مثلاً: `postgresql://...?ssl=true`)
   - اضغط **"Save Changes"**
5. **أعد نشر** الـ service (Render سيفعل ذلك تلقائياً عند الحفظ)

---

## ✅ التحقق من الإعداد

### 1. تحقق من Logs:
بعد إعادة النشر، تحقق من **Logs** في Render Dashboard. يجب أن ترى:

```
[ENV CHECK] ✅ All required environment variables are set
[PRISMA] 📋 Database Connection Info:
  Host: dpg-xxxxx-a.render.com
  Port: 5432
  Database: banda_chao_db
  User: banda_chao_user
  SSL: configured ✅
  Contains 'render.com': ✅ Yes
[PRISMA] ✅ SSL already configured in DATABASE_URL
✅ Database connection verified
```

### 2. اختبار الاتصال:
بعد إعادة النشر، جرب TestSprite مرة أخرى. يجب أن يعمل التسجيل بنجاح.

---

## 🐛 حل المشاكل

### خطأ: "Database connection error"

#### الحل 1: تحقق من DATABASE_URL
- تأكد من أن الـ URL صحيح
- تأكد من إضافة `?ssl=true` في النهاية
- تحقق من أن username و password صحيحين

#### الحل 2: تحقق من قاعدة البيانات
- تأكد من أن قاعدة البيانات **نشطة** في Render
- تحقق من أن الـ **IP Whitelist** يسمح بالاتصال (Render يسمح تلقائياً للـ services في نفس الحساب)

#### الحل 3: تحقق من Logs
- اذهب إلى **Logs** في Render Dashboard
- ابحث عن أخطاء مثل:
  - `P1001` = Connection Refused
  - `P1000` = Authentication Failed
  - `P1003` = Database Not Found
  - `SSL` = SSL connection required

---

## 📝 ملخص سريع

### متغيرات البيئة المطلوبة:

| المتغير | القيمة المطلوبة | مثال |
|---------|------------------|------|
| `DATABASE_URL` | `postgresql://...?ssl=true` | `postgresql://user:pass@host:5432/db?ssl=true` |
| `JWT_SECRET` | Random secure string | `banda-chao-jwt-secret-2024` |
| `FRONTEND_URL` | Frontend URL | `https://banda-chao-frontend.onrender.com` |
| `NODE_ENV` | `production` | `production` |
| `GEMINI_API_KEY` | (اختياري) | `your-api-key` |

---

## 🚀 بعد الإعداد

1. **احفظ** جميع متغيرات البيئة
2. **انتظر** إعادة النشر التلقائي (أو أعد النشر يدوياً)
3. **تحقق** من Logs للتأكد من نجاح الاتصال
4. **اختبر** TestSprite مرة أخرى

---

## 📞 إذا استمرت المشكلة

1. تحقق من **Logs** في Render Dashboard
2. ابحث عن أخطاء تبدأ بـ `[REGISTER_ERROR]` أو `[PRISMA]`
3. شارك رسالة الخطأ الكاملة للحصول على مساعدة إضافية

