# 🔐 إعداد Google OAuth - دليل كامل

**تاريخ الإضافة:** 7 نوفمبر 2025

---

## ✅ ما تم إنجازه

1. ✅ **Backend OAuth Routes** (`server/src/api/oauth.ts`)
   - `GET /api/v1/oauth/google` - بدء عملية OAuth
   - `POST /api/v1/oauth/google/callback` - معالجة callback من Google

2. ✅ **Frontend Pages**
   - تحديث `/app/login/page.tsx` - إضافة زر Google
   - تحديث `/app/register/page.tsx` - إضافة زر Google
   - تحديث `/app/auth/callback/route.ts` - معالجة callback
   - إنشاء `/app/auth/callback-handler/page.tsx` - حفظ token

3. ✅ **AuthContext**
   - إضافة `setUser` function لدعم OAuth login

---

## 📋 الخطوات المطلوبة لإكمال الإعداد

### **الخطوة 1: إنشاء Google OAuth Credentials**

#### 1.1. اذهب إلى Google Cloud Console
```
https://console.cloud.google.com/
```

#### 1.2. إنشاء مشروع جديد (أو استخدام مشروع موجود)
1. اضغط على **"Select a project"** في الأعلى
2. اضغط **"New Project"**
3. أدخل اسم المشروع: `Banda Chao`
4. اضغط **"Create"**

#### 1.3. تفعيل Google+ API
1. اذهب إلى **"APIs & Services"** → **"Library"**
2. ابحث عن **"Google+ API"** أو **"Google Identity Services"**
3. اضغط **"Enable"**

#### 1.4. إنشاء OAuth 2.0 Credentials
1. اذهب إلى **"APIs & Services"** → **"Credentials"**
2. اضغط **"Create Credentials"** → **"OAuth client ID"**
3. إذا طُلب منك، أدخل **"OAuth consent screen"**:
   - **User Type:** External
   - **App name:** Banda Chao
   - **User support email:** أدخل بريدك الإلكتروني
   - **Developer contact information:** أدخل بريدك الإلكتروني
   - اضغط **"Save and Continue"**
   - في **"Scopes"**، اضغط **"Save and Continue"**
   - في **"Test users"** (اختياري)، اضغط **"Save and Continue"**
   - اضغط **"Back to Dashboard"**

4. الآن في **"Create OAuth client ID"**:
   - **Application type:** Web application
   - **Name:** Banda Chao Web Client
   - **Authorized JavaScript origins:**
     - `http://localhost:3000`
     - `https://banda-chao.vercel.app`
   - **Authorized redirect URIs:**
     - `http://localhost:3000/auth/callback?provider=google`
     - `https://banda-chao.vercel.app/auth/callback?provider=google`
   - اضغط **"Create"**

5. **انسخ:**
   - **Client ID** → `GOOGLE_CLIENT_ID`
   - **Client Secret** → `GOOGLE_CLIENT_SECRET`

---

### **الخطوة 2: إضافة Environment Variables في Render**

#### 2.1. اذهب إلى Render Dashboard
```
https://dashboard.render.com/
```

#### 2.2. افتح Backend Service
1. اضغط على **"banda-chao-backend"** service
2. اضغط على **"Environment"** tab

#### 2.3. أضف Environment Variables
1. اضغط **"Add Environment Variable"**
2. أضف:
   - **Key:** `GOOGLE_CLIENT_ID`
   - **Value:** (الصق Client ID من Google Cloud Console)
   - اضغط **"Save"**

3. اضغط **"Add Environment Variable"** مرة أخرى
4. أضف:
   - **Key:** `GOOGLE_CLIENT_SECRET`
   - **Value:** (الصق Client Secret من Google Cloud Console)
   - اضغط **"Save"**

5. **مهم:** تأكد من وجود:
   - `FRONTEND_URL` = `https://banda-chao.vercel.app`
   - `JWT_SECRET` = (موجود بالفعل)
   - `DATABASE_URL` = (موجود بالفعل)

#### 2.4. إعادة تشغيل Backend
1. اضغط على **"Manual Deploy"** → **"Deploy latest commit"**
2. انتظر حتى يكتمل Deploy (3-5 دقائق)

---

### **الخطوة 3: التحقق من الإعداد**

#### 3.1. اختبر OAuth Endpoint
افتح في المتصفح:
```
https://banda-chao-backend.onrender.com/api/v1/oauth/google
```

**النتيجة المتوقعة:**
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "callbackUrl": "https://banda-chao.vercel.app/auth/callback?provider=google"
}
```

#### 3.2. اختبر Frontend
1. اذهب إلى: `https://banda-chao.vercel.app/login`
2. اضغط على زر **"تسجيل الدخول بواسطة Google"**
3. يجب أن يتم توجيهك إلى Google Login
4. بعد تسجيل الدخول، يجب أن تعود إلى الموقع

---

## 🎯 كيفية عمل OAuth Flow

```
1. المستخدم يضغط "تسجيل الدخول بواسطة Google"
   ↓
2. Frontend يطلب OAuth URL من Backend
   GET /api/v1/oauth/google
   ↓
3. Backend يعيد Google OAuth URL
   ↓
4. Frontend يوجه المستخدم إلى Google
   window.location.href = authUrl
   ↓
5. المستخدم يسجل الدخول في Google
   ↓
6. Google يوجه المستخدم إلى Callback URL
   /auth/callback?provider=google&code=...
   ↓
7. Frontend Callback Route يرسل code إلى Backend
   POST /api/v1/oauth/google/callback
   ↓
8. Backend يتبادل code مع access_token من Google
   ↓
9. Backend يحصل على معلومات المستخدم من Google
   ↓
10. Backend يبحث عن المستخدم في Database (أو ينشئه)
    ↓
11. Backend يعيد JWT token
    ↓
12. Frontend يحفظ token ويوجه المستخدم للصفحة الرئيسية
```

---

## ⚠️ ملاحظات مهمة

### 1. **iCloud/Apple Sign In**
- حاليًا، تم إضافة Google OAuth فقط
- لإضافة Apple/iCloud Sign In، يجب:
  1. إنشاء Apple Developer Account
  2. إعداد Sign in with Apple
  3. إضافة routes مشابهة في `server/src/api/oauth.ts`
  4. إضافة أزرار في Login/Register pages

### 2. **البيئة المحلية (Development)**
- تأكد من إضافة `localhost:3000` في Google OAuth Console
- أضف Environment Variables في `.env.local`:
  ```
  GOOGLE_CLIENT_ID=your-client-id
  GOOGLE_CLIENT_SECRET=your-client-secret
  FRONTEND_URL=http://localhost:3000
  ```

### 3. **الأمان**
- **لا تشارك** `GOOGLE_CLIENT_SECRET` في Frontend
- تأكد من أن Callback URL صحيح في Google Console
- استخدم HTTPS في Production

---

## 🐛 Troubleshooting

### المشكلة: "Google OAuth not configured"
**الحل:** تأكد من إضافة `GOOGLE_CLIENT_ID` و `GOOGLE_CLIENT_SECRET` في Render

### المشكلة: "redirect_uri_mismatch"
**الحل:** تأكد من إضافة Callback URL الصحيح في Google Console:
- `https://banda-chao.vercel.app/auth/callback?provider=google`

### المشكلة: "Invalid authorization code"
**الحل:** 
- تأكد من أن `GOOGLE_CLIENT_SECRET` صحيح
- تأكد من أن Callback URL مطابق تمامًا

### المشكلة: المستخدم لا يُنشأ في Database
**الحل:** 
- تأكد من أن Database connection يعمل
- تحقق من Render Logs لأخطاء Prisma

---

## ✅ الخطوات التالية

بعد إكمال الإعداد:
1. ✅ اختبر Google OAuth في Production
2. ✅ تأكد من أن المستخدمين الجدد يُنشأون بشكل صحيح
3. ✅ تأكد من أن Profile Pictures تُحفظ من Google
4. ⏳ (اختياري) أضف Apple/iCloud Sign In

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. تحقق من Render Logs
2. تحقق من Vercel Logs
3. تحقق من Google Cloud Console → OAuth consent screen
4. تحقق من Network tab في Browser Console

---

**🎉 تهانينا! Google OAuth جاهز للاستخدام!**

