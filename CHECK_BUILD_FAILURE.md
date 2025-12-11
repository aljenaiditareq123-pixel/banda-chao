# 🔍 كيفية التحقق من سبب فشل Build

## ⚠️ ما نراه من Render Dashboard:

### Warning Message:
```
"Newer logs may be unavailable because a recent deploy failed. View recent events."
```

### الوضع الحالي:
- ✅ Logs tab مفتوح
- ⚠️ لكن يعرض **Runtime Logs** (GET requests) وليس **Build Logs**
- ❌ Build Logs غير مرئية في هذا العرض

---

## ✅ الحل: فتح Build Logs

### الطريقة #1: من تبويب "Events" (الموصى به)

1. **في Render Dashboard:**
   - في القائمة الجانبية اليسرى، اضغط على **"Events"** (تحت "MONITOR")
   - أو اذهب مباشرة: https://dashboard.render.com/web/[SERVICE_ID]/events

2. **ابحث عن آخر Build:**
   - ستجد قائمة بجميع الأحداث (Events)
   - ابحث عن آخر event مع status "Failed" أو "Build failed"
   - اضغط عليه لفتح Build Logs

3. **اقرأ Build Logs:**
   - سترى Build Logs كاملة
   - ابحث عن آخر سطر خطأ (Error message)
   - انسخ الخطأ وأرسله لي

---

### الطريقة #2: من آخر Deploy Attempt

1. **في صفحة Service الرئيسية:**
   - في الأعلى، ستجد قسم "Deployments" أو "Recent Deploys"
   - اضغط على آخر deployment (عادة الأحدث في الأعلى)

2. **افتح Build Logs:**
   - اضغط على "View Build Logs" أو "Build Logs"
   - سترى Build Logs الكاملة

---

### الطريقة #3: من Manual Deploy

1. **اضغط "Manual Deploy":**
   - في صفحة Service الرئيسية
   - اضغط "Manual Deploy" → "Clear build cache & deploy"

2. **راقب Build Logs:**
   - Build Logs ستفتح تلقائياً أثناء البناء
   - راقب حتى يظهر الخطأ

---

## 🔍 ما تبحث عنه في Build Logs

### الأخطاء الشائعة:

1. **Module not found:**
   ```
   Module not found: Can't resolve 'package-name'
   ```
   - **الحل:** تأكد من أن package موجود في `package.json`

2. **Build command failed:**
   ```
   Error: Command failed: npm ci
   ```
   - **الحل:** تحقق من `package-lock.json` أو استخدم `npm install`

3. **TypeScript errors:**
   ```
   Type error: ...
   ```
   - **الحل:** أصلح TypeScript errors قبل Build

4. **Memory limit exceeded:**
   ```
   FATAL ERROR: Reached heap limit
   ```
   - **الحل:** استخدم standalone output (موجود بالفعل)

5. **Environment variables missing:**
   ```
   Error: Environment variable X is not set
   ```
   - **الحل:** أضف Environment Variable في Render Dashboard

---

## 📋 Checklist: خطوات التحقق

- [ ] افتح تبويب "Events" في Render Dashboard
- [ ] ابحث عن آخر Build failed
- [ ] افتح Build Logs
- [ ] انسخ آخر سطر خطأ
- [ ] أرسل الخطأ لي لتحليله

---

## 🚀 الخطوة التالية

بعد أن ترى Build Logs:
1. انسخ آخر سطر خطأ كامل
2. أرسله لي
3. سأقوم بتحليله وإصلاحه

---

**🔍 الآن اذهب إلى "Events" tab في Render Dashboard وابحث عن آخر Build failed!**
