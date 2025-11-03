# ✅ Render - Deploy Web Service

## 🎯 **أنت في صفحة الإعداد الأخيرة!**

---

## 📝 **الخطوات:**

### **1. Instance Type:**

#### **ابحث عن:**
- **Free** plan (مجاني) - للبدء
- أو **Starter** (مدفوع لكن أرخص)
- أو استخدم **Pro** إذا كان لديك budget

#### **إذا لم تجد Free:**
- يمكنك استخدام **Starter** أو **Pro**
- أو **Skip** وDeploy الآن (يمكن تغييره لاحقاً)

---

### **2. Environment Variables (لاحقاً):**

#### **الآن:**
- **تخطّى** Environment Variables
- سنضيفها بعد إنشاء Database

---

### **3. Deploy Web Service:**

#### **في الأسفل:**
- اضغط **"Deploy Web Service"** (الزر الأسود الكبير)
- Render سيبدأ البناء والنشر

---

## ⏱️ **بعد Deploy:**

### **Render سيبدأ:**
- ✅ Clone Repository
- ✅ Install Dependencies
- ⚠️ **قد يفشل Build** لأنه يحتاج Database URL
- لا مشكلة - سننشئ Database ونضيف Variables

---

## 📝 **بعد Deploy (أو إذا فشل Build):**

### **إنشاء Database:**

#### **1. في Render Dashboard:**
- **New** → **PostgreSQL**

#### **2. إعدادات Database:**
- **Name:** `banda-chao-db`
- **Database:** `banda-chao-db`
- **User:** (سيحدده Render تلقائياً)
- **Region:** (نفس Region الـ Web Service)

#### **3. Create Database:**
- اضغط **"Create Database"**
- انتظر حتى يكتمل (2-3 دقائق)

#### **4. نسخ Database URL:**
- بعد الإنشاء، ستجد **"Internal Database URL"**
- انسخه (يبدأ بـ `postgresql://...`)

---

### **إضافة Environment Variables:**

#### **في Web Service Settings:**
- **Environment** → **Add Environment Variable**

#### **أضف:**
1. **DATABASE_URL:**
   - Value: (Database URL الذي نسخته)

2. **NODE_ENV:**
   - Value: `production`

3. **JWT_SECRET:**
   - Value: (أي نص عشوائي طويل، مثلاً: `banda-chao-secret-key-2025-super-secure`)

4. **JWT_EXPIRES_IN:**
   - Value: `7d`

5. **FRONTEND_URL:**
   - Value: `https://your-vercel-app.vercel.app` (أو `http://localhost:3000` للاختبار)

6. **PORT:**
   - (سيحدده Render تلقائياً - لا حاجة لإضافته)

---

### **Redeploy:**

#### **بعد إضافة Environment Variables:**
- Render سيبدأ Build جديد تلقائياً
- أو اضغط **"Manual Deploy"** → **"Deploy latest commit"**

---

## ✅ **بعد النشر الناجح:**

### **ستحصل على:**
- ✅ Backend URL (مثلاً: `https://banda-chao-backend.onrender.com`)
- ✅ يمكنك استخدامه في Frontend

---

## 📋 **ملخص:**

1. ✅ **Deploy Web Service** الآن
2. ✅ **Create PostgreSQL Database**
3. ✅ **Add Environment Variables**
4. ✅ **Redeploy**
5. ✅ جاهز!

---

**اضغط 'Deploy Web Service' الآن!** 🚀

