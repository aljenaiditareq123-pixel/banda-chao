# 🔐 Universal Login Portal - NextAuth.js Setup Guide

## تم إعداد بوابة الدخول العالمية بنجاح! ✅

تم تنفيذ نظام تسجيل دخول عالمي متكامل باستخدام NextAuth.js مع دعم:
- ✅ **WeChat Sign-In** (الدخول السريع عبر WeChat - ملك السوق الصيني 👑)
- ✅ **Google Sign-In** (الدخول بجوجل - الخيار الافتراضي العالمي)
- ✅ **Facebook Sign-In** (الدخول عبر Facebook)
- ✅ **Twitter Sign-In** (الدخول عبر Twitter)
- ✅ **Magic Link** (روابط الدخول السحرية بدون كلمة مرور)
- ✅ صفحة تسجيل دخول ذكية بتصميم عمودين (Desktop) مع WeChat كخيار رئيسي
- ✅ حماية الصفحات الخاصة عبر Middleware
- ✅ دعم متعدد اللغات (عربي، إنجليزي، صيني)
- ✅ تكامل كامل مع GamifiedProfile و BottomNav

---

## 📋 متغيرات البيئة المطلوبة

أضف المتغيرات التالية إلى ملف `.env.local`:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000  # في الإنتاج: https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key-change-this-in-production

# WeChat OAuth (مطلوب للسوق الصيني 👑)
WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret
NEXT_PUBLIC_WECHAT_APP_ID=your-wechat-app-id  # For client-side redirect

# Google OAuth (الخيار الافتراضي العالمي)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth (اختياري)
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
NEXT_PUBLIC_FACEBOOK_CLIENT_ID=your-facebook-app-id

# Twitter OAuth (اختياري)
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
NEXT_PUBLIC_TWITTER_CLIENT_ID=your-twitter-client-id

# Email Provider (Magic Links) - SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@banda-chao.com
```

---

## 🔧 كيفية الحصول على OAuth Credentials

### WeChat OAuth (الأهم للسوق الصيني 👑)

1. اذهب إلى [WeChat Open Platform](https://open.weixin.qq.com/)
2. سجل دخولك أو أنشئ حساب جديد
3. أنشئ **Website Application** (网站应用)
4. احصل على `AppID` و `AppSecret`
5. أضف **Authorized redirect URI**:
   - Development: `http://localhost:3000/[locale]/auth/callback/wechat`
   - Production: `https://yourdomain.com/[locale]/auth/callback/wechat`
6. انسخ `AppID` و `AppSecret` وضعها في `.env.local`

**ملاحظة:** WeChat يتطلب موقع ويب معتمد في الصين للاستخدام الكامل.

### Google OAuth (الخيار الافتراضي العالمي)

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد أو اختر مشروع موجود
3. اذهب إلى **APIs & Services** > **Credentials**
4. انقر على **Create Credentials** > **OAuth client ID**
5. اختر **Web application**
6. أضف **Authorized redirect URIs**:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. انسخ `Client ID` و `Client Secret` وضعها في `.env.local`

### Facebook OAuth (اختياري)

1. اذهب إلى [Facebook Developers](https://developers.facebook.com/)
2. أنشئ تطبيق جديد
3. أضف **Facebook Login** product
4. أضف **Valid OAuth Redirect URIs**:
   - Development: `http://localhost:3000/api/auth/callback/facebook`
   - Production: `https://yourdomain.com/api/auth/callback/facebook`
5. احصل على `App ID` و `App Secret`

### Twitter OAuth (اختياري)

1. اذهب إلى [Twitter Developer Portal](https://developer.twitter.com/)
2. أنشئ تطبيق جديد
3. اذهب إلى **Keys and tokens**
4. احصل على `API Key` و `API Secret Key`
5. أضف **Callback URL**:
   - Development: `http://localhost:3000/api/auth/callback/twitter`
   - Production: `https://yourdomain.com/api/auth/callback/twitter`

---

## 📧 كيفية إعداد SMTP للروابط السحرية (Magic Links)

### Gmail (الأسهل):

1. اذهب إلى حساب Gmail الخاص بك
2. فعّل **2-Step Verification**
3. اذهب إلى [App Passwords](https://myaccount.google.com/apppasswords)
4. أنشئ كلمة مرور تطبيق جديدة
5. استخدم هذه الكلمة في `SMTP_PASSWORD`

### خوادم SMTP أخرى:

```bash
# مثال: SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key

# مثال: Mailgun
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@yourdomain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
```

---

## 🎯 الصفحات المحمية

الصفحات التالية تتطلب تسجيل الدخول (يتم حمايتها تلقائياً عبر Middleware):
- `/maker` (جميع صفحات الصانع)
- `/profile` (البروفايل)
- `/cart` (السلة)
- `/checkout` (الدفع)
- `/orders` (الطلبات)
- `/addresses` (العناوين)
- `/payment` (طرق الدفع)

سيتم توجيه المستخدمين غير المسجلين تلقائياً إلى صفحة تسجيل الدخول مع `callbackUrl` للعودة بعد الدخول.

---

## 📍 المسارات المضافة

### صفحات تسجيل الدخول:
- `/ar/auth/signin` - صفحة تسجيل الدخول (عربي)
- `/en/auth/signin` - صفحة تسجيل الدخول (إنجليزي)
- `/zh/auth/signin` - صفحة تسجيل الدخول (صيني)

### API Routes:
- `/api/auth/[...nextauth]` - NextAuth handler (يدير جميع عمليات المصادقة)

---

## 🎨 الميزات المضافة

1. **صفحة تسجيل دخول ذكية (Smart Sign-In Page)**:
   - تصميم عمودين على Desktop (يسار: صورة باندا، يمين: خيارات الدخول)
   - **زر WeChat مميز وبارز** (الخيار الأول والأهم)
   - زر Google Sign-In واضح (الخيار الثاني)
   - صف من الأزرار الدائرية الصغيرة: Facebook, Twitter, Email
   - تأثيرات بصرية جذابة عند المرور على الأزرار
   - دعم كامل للغة العربية (RTL) والصينية والإنجليزية
   - تصميم متجاوب (Responsive) للموبايل والديسكتوب

2. **GamifiedProfile محدّث**:
   - يعرض زر تسجيل دخول للمستخدمين غير المسجلين
   - يعرض البروفايل الكامل للمستخدمين المسجلين
   - **يعرض صورة واسم المستخدم من المزود** (Google/WeChat/Facebook/Twitter)
   - يعرض البريد الإلكتروني إذا كان متاحاً

3. **BottomNav محدّث**:
   - يوجّه المستخدمين غير المسجلين إلى صفحة تسجيل الدخول عند الضغط على "حسابي"
   - يوجّه المستخدمين غير المسجلين إلى صفحة تسجيل الدخول عند الضغط على "السلة"

4. **Middleware الحماية**:
   - يحمي جميع الصفحات الخاصة تلقائياً
   - يوجّه المستخدمين إلى صفحة تسجيل الدخول عند الحاجة
   - يدعم كل من NextAuth sessions و JWT tokens (النظام القديم)

---

## 🚀 الاستخدام في المكونات

### استخدام الجلسة في أي مكون:

```tsx
'use client';

import { useSession } from 'next-auth/react';

export default function MyComponent() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Please sign in</div>;
  }

  return <div>Hello {session?.user?.name}!</div>;
}
```

### تسجيل الدخول برمجياً:

```tsx
import { signIn, signOut } from 'next-auth/react';

// تسجيل الدخول مع Google
await signIn('google', { callbackUrl: '/profile' });

// تسجيل الدخول مع Email (Magic Link)
await signIn('email', { 
  email: 'user@example.com',
  callbackUrl: '/profile' 
});

// تسجيل الخروج
await signOut({ callbackUrl: '/' });
```

---

## ⚠️ ملاحظات مهمة

1. **NEXTAUTH_SECRET**: يجب أن يكون قيمة عشوائية قوية. يمكنك توليد واحدة باستخدام:
   ```bash
   openssl rand -base64 32
   ```

2. **NEXTAUTH_URL**: في الإنتاج، يجب أن يكون HTTPS

3. **الصفحات الحالية**: الصفحات الموجودة (`/login`, `/signup`) لا تزال موجودة لكن يُنصح بالاستخدام مع NextAuth

4. **التكامل مع النظام القديم**: يمكن استخدام NextAuth مع نظام JWT الموجود حالياً

---

## ✅ الخطوات التالية (اختياري)

- [ ] إضافة Prisma Adapter لتخزين الجلسات في قاعدة البيانات
- [ ] إضافة providers أخرى (GitHub, Apple, LinkedIn, etc.)
- [ ] تخصيص رسائل البريد الإلكتروني
- [ ] إضافة نظام الصلاحيات (Roles & Permissions)
- [ ] ربط NextAuth مع نظام JWT الموجود
- [ ] إضافة Two-Factor Authentication (2FA)
- [ ] تحسين WeChat OAuth flow (معالجة أفضل للأخطاء)

---

## 🌟 ملاحظات خاصة بـ WeChat

WeChat هو المنصة الأكثر أهمية للسوق الصيني. الصفحة مصممة لإعطاء الأولوية لـ WeChat:
- الزر الأخضر الكبير والمميز في أعلى الصفحة
- الأيقونة الواضحة لـ WeChat
- التكامل الكامل مع WeChat OAuth flow

**ملاحظة:** قد تحتاج إلى:
1. تسجيل موقعك في WeChat Open Platform
2. التحقق من الموقع (domain verification)
3. دفع رسوم للتطبيق في بعض الحالات

---

**تم إنشاء النظام بنجاح! 🎉**
