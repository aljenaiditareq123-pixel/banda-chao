# 🔐 متغيرات البيئة المطلوبة في Render - Banda Chao

دليل شامل لمتغيرات البيئة المطلوبة لنشر Banda Chao على Render.

---

## 📋 Backend (Render – banda-chao-backend)

### متغيرات Google OAuth (مطلوبة)

| Key | Value | الوصف |
|-----|-------|-------|
| `GOOGLE_CLIENT_ID` | `123456789-abcdefghijklmnop.apps.googleusercontent.com` | Client ID من Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-abcdefghijklmnopqrstuvwxyz` | Client Secret من Google Cloud Console |
| `FRONTEND_URL` | `https://banda-chao-frontend.onrender.com` | رابط Frontend (لـ OAuth callback و CORS) |

### متغيرات JWT (مطلوبة)

| Key | Value | الوصف |
|-----|-------|-------|
| `JWT_SECRET` | `your-very-long-random-secret-key-here` | مفتاح JWT قوي وعشوائي (يجب أن يكون طويلاً وعشوائياً) |
| `JWT_EXPIRES_IN` | `7d` | مدة صلاحية JWT (افتراضي: 7d، اختياري) |

### متغيرات Database (مطلوبة)

| Key | Value | الوصف |
|-----|-------|-------|
| `DATABASE_URL` | `postgresql://user:password@host:port/database` | رابط قاعدة البيانات PostgreSQL من Render |

### متغيرات Founder (اختيارية - لكن مُوصى بها)

| Key | Value | الوصف |
|-----|-------|-------|
| `FOUNDER_EMAIL` | `aljenaiditareq123@gmail.com` | بريد المؤسس (للحصول على role=FOUNDER تلقائياً) |

### متغيرات أخرى (اختيارية)

| Key | Value | الوصف |
|-----|-------|-------|
| `PORT` | `10000` | منفذ الخادم (Render يضبطه تلقائياً عادة) |
| `NODE_ENV` | `production` | بيئة Node.js (Render يضبطه تلقائياً) |
| `TEST_MODE` | `false` | وضع الاختبار (يجب أن يكون `false` في Production) |

---

## 🌐 Frontend (Render – banda-chao-frontend)

### متغيرات API (مطلوبة)

| Key | Value | الوصف |
|-----|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://banda-chao-backend.onrender.com/api/v1` | رابط Backend API (يجب أن ينتهي بـ `/api/v1`) |

### متغيرات Google OAuth (اختيارية - للمستقبل)

| Key | Value | الوصف |
|-----|-------|-------|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `123456789-abcdefghijklmnop.apps.googleusercontent.com` | Client ID من Google Cloud Console (للحصول على Google OAuth مباشرة من Frontend في المستقبل) |
| `NEXT_PUBLIC_GOOGLE_REDIRECT_URL` | `https://banda-chao-frontend.onrender.com/auth/callback?provider=google` | Redirect URL لـ Google OAuth (يجب أن يطابق تماماً ما هو موجود في Google Cloud Console) |

### متغيرات أخرى (اختيارية)

| Key | Value | الوصف |
|-----|-------|-------|
| `NODE_ENV` | `production` | بيئة Node.js (Render يضبطه تلقائياً) |

---

## 📝 ملاحظات مهمة

### 1. Google OAuth Configuration

- **Backend يحتاج**: `GOOGLE_CLIENT_ID` و `GOOGLE_CLIENT_SECRET` (مطلوب)
- **Frontend يحتاج**: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` و `NEXT_PUBLIC_GOOGLE_REDIRECT_URL` (اختياري - للمستقبل)
- **Redirect URI في Google Cloud Console** يجب أن يكون:
  ```
  https://banda-chao-frontend.onrender.com/auth/callback?provider=google
  ```

### 2. CORS Configuration

- Backend يسمح تلقائياً بـ:
  - `http://localhost:3000` (للتطوير المحلي)
  - `https://banda-chao-frontend.onrender.com` (للإنتاج)
  - `https://banda-chao.vercel.app` (إذا كنت تستخدم Vercel أيضاً)
  - أي رابط محدد في `FRONTEND_URL`

### 3. JWT_SECRET

- **يجب أن يكون قوياً**: استخدم مولد كلمات مرور عشوائية
- **مثال**: `openssl rand -base64 32`
- **لا تشاركه أبداً**: حافظ على سريته

### 4. DATABASE_URL

- Render يوفر هذا الرابط تلقائياً عند إنشاء PostgreSQL Database
- انسخه وأضفه إلى Backend Environment Variables

### 5. NEXT_PUBLIC_* Variables

- أي متغير يبدأ بـ `NEXT_PUBLIC_` متاح في Client-Side Code
- **لا تضع أسراراً** في متغيرات `NEXT_PUBLIC_*`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` آمن لأن Client ID ليس سراً (لكن Client Secret يجب أن يكون في Backend فقط)

---

## ✅ Checklist

قبل النشر، تأكد من:

### Backend:
- [ ] `GOOGLE_CLIENT_ID` موجود
- [ ] `GOOGLE_CLIENT_SECRET` موجود
- [ ] `FRONTEND_URL` موجود ويشير إلى Frontend URL الصحيح
- [ ] `JWT_SECRET` موجود وقوي
- [ ] `DATABASE_URL` موجود وصحيح
- [ ] `FOUNDER_EMAIL` موجود (إذا كنت تريد Founder access)

### Frontend:
- [ ] `NEXT_PUBLIC_API_URL` موجود ويشير إلى Backend URL الصحيح
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` موجود (اختياري)
- [ ] `NEXT_PUBLIC_GOOGLE_REDIRECT_URL` موجود (اختياري)

### Google Cloud Console:
- [ ] OAuth Consent Screen مُعدّ
- [ ] OAuth 2.0 Client ID (Web application) موجود
- [ ] Redirect URI في Google Cloud Console يطابق تماماً:
  ```
  https://banda-chao-frontend.onrender.com/auth/callback?provider=google
  ```

---

## 🚀 بعد إضافة المتغيرات

1. **احفظ** جميع Environment Variables في Render
2. **أعد تشغيل** Backend Service (Restart أو Manual Deploy)
3. **أعد بناء** Frontend Service (Manual Deploy > Clear build cache & deploy)
4. **انتظر** بضع دقائق حتى يتم تطبيق التغييرات
5. **اختبر** Google OAuth في:
   - `https://banda-chao-frontend.onrender.com/login`
   - `https://banda-chao-frontend.onrender.com/register`

---

## 🔗 روابط مفيدة

- [Render Dashboard](https://dashboard.render.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) - دليل إعداد Google OAuth

---

**آخر تحديث**: تم إنشاء هذا الملف بعد إصلاح CORS وتحسين Google OAuth configuration.

