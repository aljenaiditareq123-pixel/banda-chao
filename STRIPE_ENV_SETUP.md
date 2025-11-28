# 🔑 إعداد مفاتيح Stripe في ملف .env

## 📋 التعليمات

**ملاحظة مهمة:** ملف `.env` محمي من Git (في `.gitignore`). يجب إنشاؤه يدوياً.

### الخطوة 1: إنشاء ملف `.env` في مجلد `server/`

1. اذهب إلى مجلد `server/` في المشروع
2. أنشئ ملف جديد باسم `.env`
3. انسخ المحتوى من `server/.env.example` والصقه في `.env`

### الخطوة 2: إضافة مفاتيح Stripe

افتح ملف `server/.env` وأضف المفاتيح التالية:

```bash
# Stripe Configuration (TEST KEYS)
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_51SWMcC2L2rZwwbwY9EyCoetK9TGmkU5In4rV5SoSs0eeb41qX2q8V0KelAlZAjwNSkM5TdYDzfV9AkBITLjGiEgC00CX5VEfRW
STRIPE_MODE=test
```

### الخطوة 3: إضافة المفاتيح للـ Frontend

أنشئ ملف `.env.local` في المجلد الجذري للمشروع (ليس في `server/`) وأضف:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SWMcC2L2rZwwbwY9EyCoetK9TGmkU5In4rV5SoSs0eeb41qX2q8V0KelAlZAjwNSkM5TdYDzfV9AkBITLjGiEgC00CX5VEfRW
```

---

## ✅ التحقق

بعد إضافة المفاتيح:
1. أعد تشغيل الخادم: `cd server && npm run dev`
2. أعد تشغيل Frontend: `npm run dev`
3. تحقق من أن لا توجد أخطاء في Console

