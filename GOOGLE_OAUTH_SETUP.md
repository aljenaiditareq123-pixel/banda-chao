# 🔐 إعداد Google OAuth - Banda Chao

دليل كامل لإعداد Google OAuth في Render.

---

## 📋 المتطلبات

للحصول على Google OAuth، تحتاج إلى:

1. **Google Cloud Console Project**
2. **OAuth 2.0 Credentials** (Client ID & Client Secret)
3. **Environment Variables في Render Backend**

---

## 🚀 الخطوات التفصيلية

### الخطوة 1: إنشاء Google Cloud Project

1. افتح [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد أو اختر مشروع موجود
3. انتقل إلى **APIs & Services** > **Credentials**

---

### الخطوة 2: إنشاء OAuth 2.0 Credentials

1. في صفحة **Credentials**، اضغط على **Create Credentials** > **OAuth client ID**
2. إذا طُلب منك إعداد OAuth consent screen:
   - اختر **External** (أو Internal إذا كان لديك Google Workspace)
   - املأ المعلومات الأساسية:
     - **App name**: `Banda Chao`
     - **User support email**: `aljenaiditareq123@gmail.com`
     - **Developer contact information**: `aljenaiditareq123@gmail.com`
   - احفظ واستمر

3. في **Create OAuth client ID**:
   - **Application type**: اختر **Web application**
   - **Name**: `Banda Chao Web Client`

4. **Authorized redirect URIs** - أضف:
   ```
   https://banda-chao-frontend.onrender.com/auth/callback?provider=google
   ```
   ⚠️ **مهم جداً**: يجب أن يكون هذا الرابط مطابق تماماً!

5. اضغط **Create**

6. ستحصل على:
   - **Client ID** (مثال: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
   - **Client Secret** (مثال: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)

⚠️ **احفظ هذين القيمتين في مكان آمن!**

---

### الخطوة 3: إضافة Environment Variables في Render

1. اذهب إلى [Render Dashboard](https://dashboard.render.com/)
2. اختر خدمة **`banda-chao-backend`**
3. اضغط على تبويب **Environment**
4. أضف المتغيرات التالية:

#### متغيرات مطلوبة:

| Key | Value | الوصف |
|-----|-------|-------|
| `GOOGLE_CLIENT_ID` | `123456789-abcdefghijklmnop.apps.googleusercontent.com` | Client ID من Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-abcdefghijklmnopqrstuvwxyz` | Client Secret من Google Cloud Console |
| `FRONTEND_URL` | `https://banda-chao-frontend.onrender.com` | رابط Frontend (لـ OAuth callback) |

#### متغيرات إضافية (إذا لم تكن موجودة):

| Key | Value | الوصف |
|-----|-------|-------|
| `FOUNDER_EMAIL` | `aljenaiditareq123@gmail.com` | بريد المؤسس (للحصول على role=FOUNDER) |
| `JWT_SECRET` | `your-secret-key-here` | مفتاح JWT (يجب أن يكون عشوائي وقوي) |
| `JWT_EXPIRES_IN` | `7d` | مدة صلاحية JWT (اختياري، افتراضي: 7d) |

5. احفظ جميع المتغيرات

6. **أعد تشغيل Backend Service**:
   - اذهب إلى تبويب **Events**
   - اضغط على **Manual Deploy** > **Clear build cache & deploy**
   - أو اضغط على **Restart** في تبويب **Logs**

---

### الخطوة 4: التحقق من الإعداد

1. افتح: `https://banda-chao-frontend.onrender.com/login`
2. اضغط على **"تسجيل الدخول بواسطة Google"**
3. يجب أن يتم توجيهك إلى صفحة Google OAuth
4. بعد الموافقة، يجب أن يتم إرجاعك إلى Banda Chao

---

## 🔍 استكشاف الأخطاء

### خطأ: "GOOGLE_CLIENT_ID environment variable is not set"

**السبب**: المتغير `GOOGLE_CLIENT_ID` غير موجود في Render Backend.

**الحل**:
1. تأكد من إضافة `GOOGLE_CLIENT_ID` في Render Backend Environment Variables
2. تأكد من حفظ المتغير
3. أعد تشغيل Backend Service

---

### خطأ: "redirect_uri_mismatch"

**السبب**: Redirect URI في Google Cloud Console لا يطابق الرابط الفعلي.

**الحل**:
1. اذهب إلى Google Cloud Console > APIs & Services > Credentials
2. اضغط على OAuth 2.0 Client ID الذي أنشأته
3. في **Authorized redirect URIs**، تأكد من وجود:
   ```
   https://banda-chao-frontend.onrender.com/auth/callback?provider=google
   ```
4. احفظ التغييرات
5. انتظر بضع دقائق حتى يتم تحديث الإعدادات في Google

---

### خطأ: "CORS error"

**السبب**: Backend لا يسمح بطلبات من Frontend.

**الحل**: تم إصلاح هذا في الكود، لكن تأكد من:
1. `FRONTEND_URL` موجود في Render Backend Environment Variables
2. `https://banda-chao-frontend.onrender.com` موجود في CORS allowed origins (تم إضافته في الكود)

---

### خطأ: "Invalid client secret"

**السبب**: `GOOGLE_CLIENT_SECRET` غير صحيح أو منتهي الصلاحية.

**الحل**:
1. تأكد من نسخ `GOOGLE_CLIENT_SECRET` بشكل صحيح من Google Cloud Console
2. تأكد من عدم وجود مسافات زائدة قبل أو بعد القيمة
3. إذا لزم الأمر، أنشئ Client Secret جديد من Google Cloud Console

---

## 📝 ملاحظات مهمة

### Redirect URI يجب أن يكون مطابق تماماً:

✅ **صحيح**:
```
https://banda-chao-frontend.onrender.com/auth/callback?provider=google
```

❌ **خطأ**:
```
https://banda-chao-frontend.onrender.com/auth/callback
https://banda-chao-frontend.onrender.com/auth/callback?provider=Google
http://banda-chao-frontend.onrender.com/auth/callback?provider=google
```

### Environment Variables في Render:

- **Backend Service**: يجب أن يحتوي على `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FRONTEND_URL`
- **Frontend Service**: لا يحتاج إلى هذه المتغيرات (OAuth يحدث في Backend)

### Founder Email:

إذا سجلت الدخول باستخدام `aljenaiditareq123@gmail.com`:
- سيتم تعيين `role=FOUNDER` تلقائياً
- يمكنك الوصول إلى `/founder/**` pages
- سيظهر "Founder" badge في Header

---

## 🔗 روابط مفيدة

- [Google Cloud Console](https://console.cloud.google.com/)
- [Render Dashboard](https://dashboard.render.com/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

---

## ✅ Checklist

قبل البدء، تأكد من:

- [ ] إنشاء Google Cloud Project
- [ ] إعداد OAuth consent screen
- [ ] إنشاء OAuth 2.0 Client ID (Web application)
- [ ] إضافة Redirect URI في Google Cloud Console
- [ ] نسخ Client ID و Client Secret
- [ ] إضافة `GOOGLE_CLIENT_ID` في Render Backend
- [ ] إضافة `GOOGLE_CLIENT_SECRET` في Render Backend
- [ ] إضافة `FRONTEND_URL` في Render Backend
- [ ] إعادة تشغيل Backend Service
- [ ] اختبار تسجيل الدخول عبر Google

---

## 🎉 بعد الإعداد

بعد إعداد Google OAuth بنجاح:

1. **تسجيل الدخول عبر Google**: يعمل بشكل صحيح
2. **تسجيل الدخول بالبريد الإلكتروني**: يعمل بشكل صحيح
3. **Founder Access**: إذا سجلت الدخول بـ `aljenaiditareq123@gmail.com`، ستحصل على role=FOUNDER

---

**آخر تحديث**: تم إنشاء هذا الملف بعد إصلاح CORS وتحسين معالجة الأخطاء في صفحة Login.

