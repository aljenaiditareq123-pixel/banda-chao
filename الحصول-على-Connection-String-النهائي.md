# 🔗 الحصول على Connection String - الخطوات النهائية

**الموقع الحالي:** Project Settings → General  
**الموقع المطلوب:** Project Settings → Database → Connection string

---

## 📋 **الخطوات:**

### **الخطوة 1: اضغط على Database من CONFIGURATION**

في القائمة الجانبية (اليسار):

1. ابحث عن قسم **"CONFIGURATION"** في القائمة الجانبية
2. اضغط على **"Database"** (مع أيقونة سهم →)
3. سيتم فتح صفحة Database Connection Settings

---

### **الخطوة 2: احصل على Connection String**

في صفحة Database Connection Settings:

1. ابحث عن قسم **"Connection string"** أو **"Connection pooling"**
2. ستجد عدة خيارات:
   - **URI** (هذا ما نحتاجه)
   - **JDBC**
   - **Connection pooling**
3. اضغط على **"URI"** أو **"Connection string"**
4. ستظهر Connection String (سيبدو هكذا):
   ```
   postgresql://postgres.gtnyspavjsoolvnphihs:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```

---

### **الخطوة 3: انسخ Connection String**

1. اضغط على أيقونة **Copy** (📋) بجانب Connection String
2. أو حدد النص وانسخه (Ctrl+C / Cmd+C)

---

### **الخطوة 4: أضف SSL Mode**

**مهم:** يجب إضافة `?sslmode=require` في نهاية Connection String

**مثال:**
```
postgresql://postgres.gtnyspavjsoolvnphihs:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**ملاحظة:** 
- استبدل `[password]` بكلمة المرور التي اخترتها عند إنشاء المشروع
- Project ID: `gtnyspavjsoolvnphihs` (موجود في صفحة General Settings)

---

### **الخطوة 5: إذا نسيت كلمة المرور**

1. في صفحة Database Connection Settings
2. ابحث عن **"Database Password"** أو **"Reset database password"**
3. اضغط على **"Reset database password"**
4. اختر كلمة مرور جديدة واحفظها

---

### **الخطوة 6: إضافة DATABASE_URL في Render**

1. في Render Dashboard
2. اضغط على **"Environment"** في القائمة الجانبية
3. اضغط على **"Add Environment Variable"** أو **"+**
4. **Key:** `DATABASE_URL`
5. **Value:** الصق Connection String (مع `?sslmode=require`)
6. **احفظ** التغييرات

---

### **الخطوة 7: أعد تشغيل Backend**

بعد إضافة `DATABASE_URL`:

1. في Render Dashboard
2. اضغط على **"Manual Deploy"** → **"Restart"**
3. أو انتظر حتى يعيد Render تشغيل الخدمة تلقائياً

---

## 🗺️ **الطريق الصحيح:**

```
Project Settings → General (أنت هنا)
  └── القائمة الجانبية (اليسار)
      └── CONFIGURATION
          └── Database (→) ← اضغط هنا
              └── Connection string → URI
```

---

## 📝 **ملاحظات مهمة:**

1. **Project ID:** `gtnyspavjsoolvnphihs` (موجود في صفحة General Settings)
2. **Password:** إذا نسيت كلمة المرور، يمكنك إعادة تعيينها من Database Settings
3. **SSL Mode:** مهم جداً - أضف `?sslmode=require` في النهاية
4. **Connection Pooling:** يمكنك استخدام Connection Pooling URL (يبدأ بـ `pooler.supabase.com`)

---

## ✅ **ملخص الخطوات:**

1. ✅ من Project Settings → General
2. ✅ اضغط على **"Database"** من قسم **"CONFIGURATION"** في القائمة الجانبية
3. ✅ ابحث عن **"Connection string"** → **URI**
4. ✅ انسخ Connection String
5. ✅ أضف `?sslmode=require` في النهاية
6. ✅ أضف `DATABASE_URL` في Render Environment Variables
7. ✅ احفظ التغييرات
8. ✅ أعد تشغيل Backend

---

**📅 تاريخ:** اليوم  
**✍️ الحالة:** ✅ **جاهز - اتبع الخطوات أعلاه**

