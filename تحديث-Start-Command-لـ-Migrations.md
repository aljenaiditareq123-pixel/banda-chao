# ✅ تحديث Start Command لـ Migrations

**التاريخ:** 6 نوفمبر 2025

---

## 📋 **ما تم إنجازه:**

### **1. تحديث Start Command:**

في `server/package.json`:

**قبل:**
```json
"start": "node dist/index.js"
```

**بعد:**
```json
"start": "npx prisma migrate deploy && node dist/index.js"
```

---

## ✅ **النتيجة:**

الآن عند بدء Backend:
1. ✅ سيتم تشغيل `npx prisma migrate deploy` تلقائياً
2. ✅ سيتم إنشاء الجداول في قاعدة البيانات
3. ✅ ثم سيبدأ السيرفر (`node dist/index.js`)

---

## 📋 **الخطوات التالية:**

### **1. انتظر Deploy:**

Render سيبدأ Deploy تلقائياً بعد Push. انتظر 5-10 دقائق حتى يكتمل.

---

### **2. تحقق من Logs:**

بعد Deploy، في Render Dashboard → Logs:

يجب أن ترى:
- ✅ `Applying migration`
- ✅ `All migrations have been applied`
- ✅ `Server is running on http://localhost:PORT`

---

### **3. شغّل Seed API:**

بعد Deploy ناجح:

```bash
curl -X POST https://banda-chao-backend.onrender.com/api/v1/seed \
  -H "Content-Type: application/json" \
  -d '{"secret": "banda-chao-secret-2025"}'
```

---

## 🎯 **النتيجة المتوقعة:**

بعد Deploy و Seed:
- ✅ الجداول موجودة في قاعدة البيانات
- ✅ 5 مستخدمين وهميين
- ✅ 10 فيديوهات (5 قصيرة، 5 طويلة)
- ✅ 15 منتج وهمي
- ✅ 5 مشاركات

---

**📅 تاريخ:** اليوم  
**✍️ الحالة:** ✅ **تم التحديث - في انتظار Deploy**


