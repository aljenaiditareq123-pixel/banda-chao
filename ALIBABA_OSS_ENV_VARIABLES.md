# 🔑 Alibaba Cloud OSS - Environment Variables Guide
**تاريخ الإعداد:** 21 ديسمبر 2024

---

## ⚠️ ملاحظة مهمة

الكود يستخدم أسماء متغيرات مختلفة قليلاً عن التي أعطيتها. استخدم الأسماء التالية:

---

## 📋 أسماء المتغيرات الصحيحة (للإضافة في Render)

```env
ALIBABA_ACCESS_KEY_ID=YOUR_ALIBABA_ACCESS_KEY_ID
ALIBABA_ACCESS_KEY_SECRET=YOUR_ALIBABA_ACCESS_KEY_SECRET
ALIBABA_OSS_BUCKET=banda-chao-media
ALIBABA_OSS_REGION=oss-cn-hongkong
ALIBABA_OSS_ENDPOINT=oss-cn-hongkong.aliyuncs.com
```

---

## ❌ الأسماء التي لا تعمل

**لا تستخدم:**
- ❌ `OSS_ACCESS_KEY_ID` → استخدم `ALIBABA_ACCESS_KEY_ID`
- ❌ `OSS_ACCESS_KEY_SECRET` → استخدم `ALIBABA_ACCESS_KEY_SECRET`
- ❌ `NEXT_PUBLIC_OSS_BUCKET` → استخدم `ALIBABA_OSS_BUCKET`
- ❌ `NEXT_PUBLIC_OSS_REGION` → استخدم `ALIBABA_OSS_REGION`
- ❌ `NEXT_PUBLIC_OSS_ENDPOINT` → استخدم `ALIBABA_OSS_ENDPOINT`

---

## ✅ الخطوات

### 1. في Render Dashboard:

```
Render Dashboard → Backend Service → Environment → Add Environment Variable
```

**أضف كل متغير على حدة:**

| Key | Value |
|-----|-------|
| `ALIBABA_ACCESS_KEY_ID` | `YOUR_ALIBABA_ACCESS_KEY_ID` |
| `ALIBABA_ACCESS_KEY_SECRET` | `YOUR_ALIBABA_ACCESS_KEY_SECRET` |
| `ALIBABA_OSS_BUCKET` | `banda-chao-media` |
| `ALIBABA_OSS_REGION` | `oss-cn-hongkong` |
| `ALIBABA_OSS_ENDPOINT` | `oss-cn-hongkong.aliyuncs.com` |

### 2. Restart Service:

بعد إضافة جميع المتغيرات، اضغط "Manual Deploy".

---

## ✅ التحقق من العمل

بعد إضافة المتغيرات، في Render Logs يجب أن ترى:

```
[Storage] ✅ Using Alibaba Cloud OSS as storage provider
[Alibaba OSS] ✅ Alibaba Cloud OSS initialized successfully
[Alibaba OSS] Region: oss-cn-hongkong, Bucket: banda-chao-media
```

---

**تاريخ الإعداد:** 21 ديسمبر 2024


