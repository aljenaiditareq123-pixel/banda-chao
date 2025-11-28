# 📋 قالب متغيرات البيئة لـ Render
## Environment Variables Template for Render

**استخدم هذا القالب لتسجيل جميع القيم قبل إضافتها إلى Render**

---

## 🔐 Backend Environment Variables

### متغيرات مطلوبة (Required):

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Authentication
JWT_SECRET=your-strong-secret-key-32-chars-minimum
JWT_EXPIRES_IN=24h

# Stripe (Production)
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_STRIPE_PUBLISHABLE_KEY_HERE
STRIPE_MODE=production

# Frontend URL (for CORS)
FRONTEND_URL=https://banda-chao.onrender.com

# Server
PORT=3001
NODE_ENV=production
```

### متغيرات اختيارية (Optional):

```env
# Google Gemini API (for AI features)
GEMINI_API_KEY=your-gemini-api-key-here
```

---

## 🎨 Frontend Environment Variables

### متغيرات مطلوبة (Required):

```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://banda-chao-backend.onrender.com

# Stripe (Production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_STRIPE_PUBLISHABLE_KEY_HERE
```

---

## 📝 تعليمات الاستخدام

1. **انسخ القيم الفعلية** من مصادرها (Render, Stripe, etc.)
2. **الصقها في هذا الملف** (احذف الملف بعد الانتهاء لأسباب أمنية)
3. **استخدم هذا الملف كمرجع** عند إضافة المتغيرات في Render
4. **احذف الملف** بعد إكمال النشر

---

## ⚠️ تحذيرات أمنية

- ❌ **لا ترفع هذا الملف إلى GitHub** إذا كان يحتوي على قيم فعلية
- ❌ **لا تشارك هذا الملف** مع أي شخص
- ✅ **احذف الملف** بعد إكمال النشر
- ✅ **استخدم `.gitignore`** لاستثناء هذا الملف

---

**📅 تاريخ الإنشاء:** $(date)

