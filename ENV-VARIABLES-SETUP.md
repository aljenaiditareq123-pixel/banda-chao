# 🔐 إعداد متغيرات البيئة - Environment Variables

## 📋 المتغيرات المطلوبة

### للواجهة الأمامية (Frontend) - `.env.local`

أضف هذه المتغيرات في ملف `.env.local` في جذر المشروع:

```env
# Express Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Supabase (للاحتفاظ به مؤقتاً أو للإزالة لاحقاً)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### للخادم (Backend) - `server/.env`

أنشئ ملف `.env` في مجلد `server/` مع هذه المتغيرات:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database (PostgreSQL)
# استخدم نفس قاعدة بيانات Supabase أو أنشئ قاعدة بيانات جديدة
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars"
JWT_EXPIRES_IN="7d"

# CORS Configuration
FRONTEND_URL="http://localhost:3000"
```

---

## 📝 خطوات الإعداد

### 1. إعداد Frontend Environment Variables:

```bash
# في جذر المشروع
cd /Users/tarqahmdaljnydy/Desktop/banda-chao

# افتح أو أنشئ ملف .env.local
nano .env.local
# أو
code .env.local
```

أضف:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 2. إعداد Backend Environment Variables:

```bash
# انتقل لمجلد server
cd server

# أنشئ ملف .env
nano .env
# أو
code .env
```

أضف:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"
```

---

## 🔗 الحصول على DATABASE_URL

### خيار 1: استخدام Supabase PostgreSQL

1. اذهب إلى Supabase Dashboard
2. Settings → Database
3. Connection string → URI
4. انسخ Connection String
5. استبدل `[YOUR-PASSWORD]` بكلمة المرور
6. أضف `?sslmode=require` في النهاية

مثال:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

### خيار 2: قاعدة بيانات منفصلة

- استخدم أي PostgreSQL database
- احصل على connection string
- أضفه في `server/.env`

---

## ⚠️ ملاحظات مهمة

### أمان JWT_SECRET:
- يجب أن يكون طوله 32 حرف على الأقل
- استخدم مولد كلمات مرور قوية
- لا تشارك هذا المفتاح أبداً

مثال على JWT_SECRET قوي:
```
openssl rand -base64 32
```

### في Production:
- استخدم متغيرات بيئة آمنة
- لا تضع `.env` في Git
- استخدم خدمات إدارة Secrets (مثل Vercel Environment Variables)

---

## ✅ التحقق من الإعداد

### Frontend:
```bash
npm run dev
# افتح http://localhost:3000
# تحقق من أن API calls تعمل
```

### Backend:
```bash
cd server
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run dev
# تحقق من http://localhost:3001/api/health
```

---

## 🎯 الخطوات التالية

بعد إعداد المتغيرات:

1. ✅ تثبيت الاعتمادات في server
2. ✅ تشغيل Prisma migrations
3. ✅ تشغيل Backend server
4. ✅ تشغيل Frontend
5. ✅ اختبار تسجيل الدخول

---

**📝 تم إعداد المتغيرات!**

