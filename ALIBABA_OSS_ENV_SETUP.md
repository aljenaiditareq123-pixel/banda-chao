# 🔑 إعداد Alibaba Cloud OSS - Environment Variables
**تاريخ الإعداد:** 21 ديسمبر 2024  
**الحالة:** ✅ جاهز للاستخدام

---

## 📋 المتغيرات البيئية المطلوبة

### **للإنتاج (Render):**

أضف هذه المتغيرات في Render Dashboard → Environment Variables:

```env
ALIBABA_ACCESS_KEY_ID=YOUR_ALIBABA_ACCESS_KEY_ID
ALIBABA_ACCESS_KEY_SECRET=YOUR_ALIBABA_ACCESS_KEY_SECRET
ALIBABA_OSS_BUCKET=banda-chao-media
ALIBABA_OSS_REGION=oss-cn-hongkong
ALIBABA_OSS_ENDPOINT=oss-cn-hongkong.aliyuncs.com
```

### **للتطوير المحلي:**

أضف نفس المتغيرات في `server/.env`:

```env
# Alibaba Cloud OSS Configuration
ALIBABA_ACCESS_KEY_ID=YOUR_ALIBABA_ACCESS_KEY_ID
ALIBABA_ACCESS_KEY_SECRET=YOUR_ALIBABA_ACCESS_KEY_SECRET
ALIBABA_OSS_BUCKET=banda-chao-media
ALIBABA_OSS_REGION=oss-cn-hongkong
ALIBABA_OSS_ENDPOINT=oss-cn-hongkong.aliyuncs.com
```

---

## 🧪 اختبار الاتصال

بعد إضافة المتغيرات، اختبر الاتصال:

```bash
cd server
npx tsx scripts/test-alibaba-oss.ts
```

**النتيجة المتوقعة:**
- ✅ Configuration check passed
- ✅ Upload successful
- ✅ Deletion successful
- 🎉 All tests passed!

---

## 🔄 آلية العمل

### **أولوية Storage Provider:**

1. **Alibaba Cloud OSS** (الأولوية الأولى)
   - إذا `ALIBABA_*` vars موجودة → يستخدم Alibaba OSS

2. **Google Cloud Storage** (Fallback)
   - إذا Alibaba غير موجود لكن GCS موجود → يستخدم GCS

3. **لا شيء**
   - إذا لا يوجد أي مزود → رفض الرفع مع رسالة واضحة

---

## ✅ التحقق من التكوين

الكود يتحقق تلقائياً:

```typescript
// في server/src/api/videos.ts
if (!isStorageConfigured()) {
  return res.status(503).json({ 
    error: 'Storage service is under maintenance. Please configure Alibaba Cloud OSS or contact support.' 
  });
}
```

---

## 📍 معلومات Bucket

- **Bucket Name:** `banda-chao-media`
- **Region:** `oss-cn-hongkong` (هونج كونج - مثالي للصين)
- **Endpoint:** `oss-cn-hongkong.aliyuncs.com`

---

## 🔒 الأمان

⚠️ **مهم:** لا ترفع ملف `.env` إلى GitHub!

- ✅ `.env` في `.gitignore`
- ✅ استخدم Render Environment Variables للإنتاج
- ✅ استخدم `.env.local` للتطوير (إذا كان متاحاً)

---

**تاريخ الإعداد:** 21 ديسمبر 2024  
**الحالة:** ✅ جاهز للاستخدام بعد إضافة المتغيرات في Render


