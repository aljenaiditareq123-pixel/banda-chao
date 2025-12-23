# 🚀 Alibaba Cloud OSS - Quick Start Guide
**لربط الموقع بمخزن الفيديوهات في هونج كونج**

---

## ✅ ما تم إنجازه

1. ✅ **إضافة Environment Variables** إلى `server/.env`
2. ✅ **تحديث videos.ts** لاستخدام Alibaba Cloud OSS
3. ✅ **إنشاء Test Script** للتحقق من الاتصال

---

## 🔧 الخطوات المطلوبة (للإنتاج)

### **1. أضف المتغيرات في Render:**

اذهب إلى: **Render Dashboard → Backend Service → Environment Variables**

أضف:

```env
ALIBABA_ACCESS_KEY_ID=YOUR_ALIBABA_ACCESS_KEY_ID
ALIBABA_ACCESS_KEY_SECRET=YOUR_ALIBABA_ACCESS_KEY_SECRET
ALIBABA_OSS_BUCKET=banda-chao-media
ALIBABA_OSS_REGION=oss-cn-hongkong
ALIBABA_OSS_ENDPOINT=oss-cn-hongkong.aliyuncs.com
```

### **2. Restart Service:**

بعد إضافة المتغيرات:
- اضغط "Manual Deploy" → "Deploy latest commit"
- أو انتظر Auto-Deploy (إذا كان مفعّل)

---

## 🧪 اختبار الاتصال (محلي)

```bash
cd server
npx tsx scripts/test-alibaba-oss.ts
```

**النتيجة المتوقعة:**
```
🧪 Testing Alibaba Cloud OSS Connection...

📋 Configuration Check:
  - Access Key ID: ✅ Set
  - Access Key Secret: ✅ Set
  - Bucket: banda-chao-media
  - Region: oss-cn-hongkong
  - Endpoint: oss-cn-hongkong.aliyuncs.com

✅ Configuration check passed!

📤 Testing file upload...
✅ Upload successful!
   URL: https://banda-chao-media.oss-cn-hongkong.aliyuncs.com/test/...

🗑️  Testing file deletion...
✅ Deletion successful!

🎉 All tests passed! Alibaba Cloud OSS is working correctly.
```

---

## 📊 معلومات Bucket

- **Bucket:** `banda-chao-media`
- **Region:** `oss-cn-hongkong` (هونج كونج)
- **Endpoint:** `oss-cn-hongkong.aliyuncs.com`
- **الأولوية:** Alibaba OSS > GCS > رفض الرفع

---

## ✅ التحقق من العمل

بعد إضافة المتغيرات في Render، عند رفع فيديو:

**في Render Logs يجب أن ترى:**
```
[Storage] ✅ Using Alibaba Cloud OSS as storage provider
[Alibaba OSS] ✅ Alibaba Cloud OSS initialized successfully
[Alibaba OSS] Region: oss-cn-hongkong, Bucket: banda-chao-media
[Alibaba OSS] ✅ File uploaded: https://banda-chao-media.oss-cn-hongkong.aliyuncs.com/videos/...
```

---

## 🔒 الأمان

- ✅ `.env` في `.gitignore` (آمن)
- ✅ المفاتيح موجودة فقط محلياً وفي Render
- ⚠️ لا ترفع `.env` إلى GitHub

---

**تاريخ الإعداد:** 21 ديسمبر 2024  
**الحالة:** ✅ جاهز - أضف المتغيرات في Render فقط


