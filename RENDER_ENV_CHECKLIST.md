# ✅ Render Environment Variables Checklist

## 📋 المتغيرات المطلوبة للـ Frontend Service:

### ✅ متغيرات موجودة (من الصور):
- ✅ `NODE_ENV` = `production`
- ✅ `NODE_VERSION` = `20.11.0`
- ✅ `DATABASE_URL` = (PostgreSQL connection string)
- ✅ `FRONTEND_URL` = `https://banda-chao.onrender.com`
- ✅ `NEXTAUTH_URL` = `https://banda-chao.onrender.com`
- ✅ `FOUNDER_EMAIL` = `aljenaiditareq123@gmail.com`
- ✅ `JWT_SECRET` = (exists)
- ✅ `JWT_EXPIRES_IN` = `7d`
- ✅ `GEMINI_API_KEY` = (exists)
- ✅ `GOOGLE_SPEECH_API_KEY` = (exists)
- ✅ `STRIPE_SECRET_KEY` = (exists)
- ✅ `STRIPE_PUBLISHABLE_KEY` = (exists)
- ✅ `STRIPE_MODE` = `test`
- ✅ `GCLOUD_PROJECT_ID` = `banda-chao`
- ✅ `GCS_BUCKET_NAME` = `banda-chao-uploads-tareq`
- ✅ `GCS_SERVICE_ACCOUNT_KEY` = (exists)

### ⚠️ متغيرات قد تكون مفقودة:

#### لـ Next.js Frontend:
- ⚠️ `NEXT_PUBLIC_FRONTEND_URL` - قد يكون مطلوب
- ⚠️ `NEXT_PUBLIC_API_URL` - رابط Backend API
- ⚠️ `AUTH_SECRET` - لـ NextAuth v5 (قد يكون مطلوب مع NEXTAUTH_SECRET)
- ⚠️ `AUTH_URL` - لـ NextAuth v5 (قد يكون نفس NEXTAUTH_URL)

#### ملاحظة:
- `PORT` - Render يضيفه تلقائياً (لا حاجة لإضافته يدوياً)

---

## ✅ الإجراءات الموصى بها:

1. **تحقق من Build Command:**
   ```bash
   npm install --legacy-peer-deps && npx prisma generate && npm run build
   ```

2. **تحقق من Start Command:**
   ```bash
   npm start
   ```

3. **اختياري - تنظيف:**
   - احذف `KeySEED_SECRET` (مكرر مع SEED_SECRET)

---

**✅ Environment Variables جاهزة - يمكن المتابعة مع Build/Deploy!**
