# 🚀 نشر Backend الآن - خطوات سريعة

## الطريقة السريعة: Railway

### الخطوة 1: تثبيت Railway CLI
```bash
npm install -g @railway/cli
```

### الخطوة 2: تسجيل الدخول
```bash
railway login
```

### الخطوة 3: إنشاء مشروع
```bash
cd server
railway init
```

### الخطوة 4: إضافة PostgreSQL Database
```bash
railway add postgresql
```

### الخطوة 5: ربط Environment Variables
```bash
railway variables set JWT_SECRET="your-super-secret-key-min-32-chars"
railway variables set JWT_EXPIRES_IN="7d"
railway variables set FRONTEND_URL="https://banda-chao.vercel.app"
railway variables set NODE_ENV="production"
```

### الخطوة 6: النشر!
```bash
railway up
```

### الخطوة 7: الحصول على URL
```bash
railway domain
```

---

## الطريقة البديلة: Render (من Dashboard)

1. اذهب إلى: https://render.com
2. تسجيل الدخول/إنشاء حساب
3. New → Web Service
4. Connect GitHub repo
5. Settings:
   - **Name:** `banda-chao-backend`
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
6. Environment Variables:
   - `DATABASE_URL` (من Render PostgreSQL)
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN=7d`
   - `FRONTEND_URL=https://banda-chao.vercel.app`
   - `NODE_ENV=production`
7. Create Web Service

---

## بعد النشر:

انسخ Backend URL وأضفه في Vercel Environment Variables!

