# 🔧 إضافة SEED_SECRET في Render

**المشكلة:** Seed API فشل بسبب "Invalid secret key" ❌

**السبب:** `SEED_SECRET` غير موجود في Render Environment Variables

---

## 🔧 **الحل:**

### **الخطوة 1: افتح Environment Variables في Render**

1. في Render Dashboard
2. اضغط على **"Environment"** في القائمة الجانبية
3. أو اذهب إلى **Settings** → **Environment**

---

### **الخطوة 2: أضف SEED_SECRET**

1. اضغط على **"Add Environment Variable"** أو **"+"**
2. **Key:** `SEED_SECRET`
3. **Value:** `banda-chao-secret-2025`
4. **احفظ** التغييرات

---

### **الخطوة 3: أعد تشغيل Backend**

بعد إضافة `SEED_SECRET`:

1. في Render Dashboard
2. اضغط على **"Manual Deploy"** → **"Restart"**
3. أو انتظر حتى يعيد Render تشغيل الخدمة تلقائياً

---

### **الخطوة 4: شغّل Seed API مرة أخرى**

بعد إعادة التشغيل:

```bash
curl -X POST https://banda-chao-backend.onrender.com/api/v1/seed \
  -H "Content-Type: application/json" \
  -d '{"secret": "banda-chao-secret-2025"}'
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "Database seed completed successfully",
  "summary": {
    "users": 5,
    "videos": 10,
    "products": 15,
    "posts": 5
  }
}
```

---

## ✅ **Environment Variables المطلوبة في Render:**

| المتغير | القيمة | ملاحظات |
|---------|--------|---------|
| `DATABASE_URL` | `postgresql://...` | رابط قاعدة البيانات |
| `JWT_SECRET` | `your-secret-key` | مفتاح سري لـ JWT |
| `JWT_EXPIRES_IN` | `7d` | مدة صلاحية JWT |
| `NODE_ENV` | `production` | بيئة التشغيل |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | رابط Frontend |
| `SEED_SECRET` | `banda-chao-secret-2025` | مفتاح سري لـ Seed API |

---

## 📝 **ملخص الخطوات:**

1. ✅ افتح **Environment** في Render
2. ✅ أضف `SEED_SECRET` = `banda-chao-secret-2025`
3. ✅ احفظ التغييرات
4. ✅ أعد تشغيل Backend
5. ✅ شغّل Seed API مرة أخرى

---

**📅 تاريخ:** اليوم  
**✍️ الحالة:** ⚠️ **يحتاج إضافة SEED_SECRET في Render**

