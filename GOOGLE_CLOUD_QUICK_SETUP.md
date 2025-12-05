# 🚀 Google Cloud Quick Setup Guide
## دليل الإعداد السريع لـ Google Cloud

**آخر تحديث:** ديسمبر 2024

---

## ✅ الحالة الحالية

من الصورة، يبدو أنك لديك بالفعل:
- ✅ **API Key**: `BandaChao_Speech_Key` (موجود، لكن يحتاج مراجعة)
- ✅ **Service Account**: `banda-chao-storage@banda-chao.iam.gserviceaccount.com`
- ✅ **OAuth Client**: `banda-chao-web`

---

## 📋 الخطوات المتبقية

### 1. مراجعة وإعداد API Key للـ Speech-to-Text

#### 1.1 فحص API Key الحالي
1. في Google Cloud Console، اذهب إلى **APIs & Services** → **Credentials**
2. ابحث عن **"BandaChao_Speech_Key"**
3. انقر على **"Show key"** (أو أيقونة القائمة)
4. **انسخ المفتاح** واحفظه في مكان آمن

#### 1.2 تفعيل Speech-to-Text API
1. اذهب إلى **APIs & Services** → **Library**
2. ابحث عن **"Cloud Speech-to-Text API"**
3. تأكد من أنها **مفعّلة** (Enabled)
4. إذا لم تكن مفعّلة، انقر على **"Enable"**

#### 1.3 إضافة Restrictions للـ API Key (اختياري لكن موصى به)
1. في صفحة **Credentials**، انقر على **"BandaChao_Speech_Key"**
2. في قسم **"API restrictions"**:
   - اختر **"Restrict key"**
   - اختر **"Cloud Speech-to-Text API"** فقط
3. في قسم **"Application restrictions"**:
   - يمكنك اختيار **"HTTP referrers"** وإضافة domain الخاص بك
   - أو اتركه **"None"** للاختبار
4. انقر على **"Save"**

---

### 2. إنشاء Storage Bucket

#### 2.1 إنشاء Bucket جديد
1. اذهب إلى **Cloud Storage** → **Buckets**
2. انقر على **"Create bucket"**
3. أدخل التفاصيل:
   - **Name**: `banda-chao-uploads-tareq` (أو أي اسم تفضله)
   - **Location type**: `Region`
   - **Location**: `asia-east1` (أو أقرب region لك)
   - **Storage class**: `Standard`
   - **Access control**: `Uniform`
4. انقر على **"Create"**

#### 2.2 جعل Bucket عام (Public Access)
1. بعد إنشاء Bucket، انقر على اسمه
2. اذهب إلى **"Permissions"** tab
3. انقر على **"Grant Access"**
4. في **"New principals"**، أدخل: `allUsers`
5. في **"Role"**، اختر: `Storage Object Viewer`
6. انقر على **"Save"**
7. ستظهر تحذير - انقر على **"Allow public access"**

---

### 3. إنشاء Service Account Key (JSON)

#### 3.1 الوصول إلى Service Account
1. اذهب إلى **IAM & Admin** → **Service Accounts**
2. ابحث عن **"banda-chao-storage"**
3. انقر على اسمه

#### 3.2 إنشاء Key جديد
1. في صفحة Service Account، اذهب إلى **"Keys"** tab
2. انقر على **"Add Key"** → **"Create new key"**
3. اختر **"JSON"**
4. انقر على **"Create"**
5. سيتم تحميل ملف JSON تلقائياً - **احفظه في مكان آمن**

#### 3.3 نسخ محتوى JSON
1. افتح الملف JSON الذي تم تحميله
2. **انسخ المحتوى بالكامل**
3. ستحتاجه لـ Environment Variable `GCS_SERVICE_ACCOUNT_KEY` في Render

---

### 4. جمع جميع Environment Variables

#### 4.1 من Google Cloud Console
1. **Project ID**: 
   - من أعلى الصفحة، انسخ **Project ID** (يبدو أنه `banda-chao`)
   
2. **GCS Bucket Name**: 
   - الاسم الذي اخترته للـ Bucket (مثلاً: `banda-chao-uploads-tareq`)

3. **GCS Service Account Key**: 
   - محتوى ملف JSON الذي أنشأته في الخطوة 3.2
   - **⚠️ مهم:** انسخ المحتوى بالكامل (يبدأ بـ `{"type":"service_account",...}`)

4. **GOOGLE_SPEECH_API_KEY**: 
   - من **Credentials** → **BandaChao_Speech_Key** → **Show key**
   - انسخ المفتاح الكامل

---

### 5. إضافة Environment Variables في Render

#### 5.1 في Render Dashboard
1. اذهب إلى **Backend Service** → **Environment**
2. انقر على **"Add Environment Variable"**

#### 5.2 إضافة المتغيرات التالية:

| Key | Value | ملاحظات |
|-----|-------|---------|
| `GCLOUD_PROJECT_ID` | `banda-chao` | Project ID من Google Cloud |
| `GCS_BUCKET_NAME` | `banda-chao-uploads-tareq` | اسم Bucket الذي أنشأته |
| `GCS_SERVICE_ACCOUNT_KEY` | `{...JSON content...}` | محتوى ملف JSON بالكامل |
| `GOOGLE_SPEECH_API_KEY` | `AIzaSy...` | API Key من Credentials |

**⚠️ مهم جداً:**
- عند إضافة `GCS_SERVICE_ACCOUNT_KEY`، الصق محتوى JSON **بالكامل** في حقل Value
- لا تنسخ فقط جزء من JSON
- يجب أن يبدأ بـ `{"type":"service_account",...}` وينتهي بـ `}`

---

### 6. التحقق من الإعداد

#### 6.1 إعادة تشغيل الخدمة
1. في Render Dashboard، اذهب إلى **Backend Service**
2. انقر على **"Manual Deploy"** → **"Deploy latest commit"**
3. انتظر حتى يكتمل البناء

#### 6.2 اختبار Speech-to-Text
1. افتح AI Assistant: `https://banda-chao-frontend.onrender.com/founder/assistant`
2. جرب استخدام الميكروفون
3. تأكد من أن Speech-to-Text يعمل

#### 6.3 اختبار GCS Upload
1. جرب رفع صورة أو ملف
2. تأكد من أن الملف يتم رفعه إلى GCS بنجاح

---

## 🔒 نصائح أمنية

1. **لا تشارك API Keys** مع أي شخص
2. **لا ترفع ملفات JSON** إلى GitHub
3. **استخدم Environment Variables** فقط في Render
4. **راجع Permissions** بانتظام
5. **استخدم API Key Restrictions** لتقليل المخاطر

---

## 📝 Checklist

- [ ] Speech-to-Text API مفعّلة
- [ ] API Key (`BandaChao_Speech_Key`) موجود ومضبوط
- [ ] Storage Bucket (`banda-chao-uploads-tareq`) تم إنشاؤه
- [ ] Bucket عام (Public Access) مفعّل
- [ ] Service Account Key (JSON) تم إنشاؤه
- [ ] جميع Environment Variables أُضيفت في Render
- [ ] الخدمة تم إعادة تشغيلها
- [ ] Speech-to-Text يعمل
- [ ] GCS Upload يعمل

---

## 🆘 حل المشاكل

### إذا فشل Speech-to-Text:
1. تحقق من أن `GOOGLE_SPEECH_API_KEY` موجود في Render
2. تحقق من أن Speech-to-Text API مفعّلة
3. تحقق من Logs في Render

### إذا فشل GCS Upload:
1. تحقق من أن `GCS_SERVICE_ACCOUNT_KEY` موجود في Render
2. تحقق من أن JSON content كامل وصحيح
3. تحقق من أن Bucket موجود وله Public Access
4. تحقق من Logs في Render

---

**✅ بعد إكمال جميع الخطوات، سيكون Google Cloud جاهزاً بالكامل!**

