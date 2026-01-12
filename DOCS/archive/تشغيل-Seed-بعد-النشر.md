# 🌱 تشغيل Seed بعد النشر

**ملاحظة:** Seed يجب تشغيله على الخادم بعد النشر ✅

---

## 📋 **الخطوات:**

### **الطريقة 1: تشغيل Seed على Render (Backend)**

1. **اذهب إلى Render Dashboard:**
   - افتح: [render.com](https://render.com)
   - اختر Web Service: `banda-chao-backend`

2. **افتح Shell:**
   - اضغط على **"Shell"** tab
   - أو استخدم Render CLI

3. **شغّل Seed:**
   ```bash
   cd server
   npx prisma db seed
   ```

---

### **الطريقة 2: تشغيل Seed محلياً (إذا كان لديك DATABASE_URL)**

```bash
cd server
npx prisma db seed
```

**ملاحظة:** تأكد من أن `DATABASE_URL` في `.env` يشير إلى قاعدة البيانات المنشورة.

---

### **الطريقة 3: إضافة Seed Command في Render Build**

يمكنك إضافة Seed في Build Command:

**في Render Dashboard → Environment:**
- **Build Command:** 
  ```
  npm install && npx prisma generate && npm run build && npx prisma db seed
  ```

**⚠️ تحذير:** هذا سيشغّل Seed في كل Build. استخدمه فقط إذا أردت إعادة ملء البيانات.

---

## ✅ **النتيجة المتوقعة:**

بعد تشغيل Seed، ستحصل على:

- ✅ 5 مستخدمين وهميين
- ✅ 10 فيديوهات (5 قصيرة + 5 طويلة)
- ✅ 15 منتج وهمي
- ✅ 5 منشورات

---

## 🔑 **بيانات تسجيل الدخول:**

| Email | Password |
|-------|----------|
| `user1@bandachao.com` | `password123` |
| `user2@bandachao.com` | `password123` |
| `user3@bandachao.com` | `password123` |
| `user4@bandachao.com` | `password123` |
| `user5@bandachao.com` | `password123` |

---

**🚀 بعد تشغيل Seed، افتح الموقع وستجد المحتوى!**


