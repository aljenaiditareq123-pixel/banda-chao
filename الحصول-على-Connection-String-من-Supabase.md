# 🔗 الحصول على Connection String من Supabase

**المشروع:** banda chao  
**المنطقة:** ap-southeast-1 (Southeast Asia)

---

## 📋 **الخطوات:**

### **الخطوة 1: افتح المشروع**

1. في صفحة "Projects" في Supabase
2. اضغط على مشروع **"banda chao"** (الكرت الأبيض)
3. سيتم فتح لوحة تحكم المشروع

---

### **الخطوة 2: اذهب إلى Settings**

1. في القائمة الجانبية (اليسار)
2. اضغط على **Settings** (⚙️) في الأسفل
3. أو ابحث عن أيقونة الترس ⚙️

---

### **الخطوة 3: افتح Database Settings**

1. في صفحة Settings
2. اضغط على **"Database"** من القائمة الجانبية
3. أو ابحث عن قسم "Database" في الصفحة

---

### **الخطوة 4: احصل على Connection String**

1. في صفحة Database Settings
2. ابحث عن قسم **"Connection string"** أو **"Connection pooling"**
3. ستجد عدة خيارات:
   - **URI** (هذا ما نحتاجه)
   - **JDBC**
   - **Connection pooling**
4. اضغط على **"URI"** أو **"Connection string"**
5. ستظهر Connection String (سيبدو هكذا):
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```

---

### **الخطوة 5: انسخ Connection String**

1. اضغط على أيقونة **Copy** (📋) بجانب Connection String
2. أو حدد النص وانسخه (Ctrl+C / Cmd+C)

---

### **الخطوة 6: أضف SSL Mode**

**مهم:** يجب إضافة `?sslmode=require` في نهاية Connection String

**مثال:**
```
postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**ملاحظة:** 
- استبدل `[password]` بكلمة المرور التي اخترتها عند إنشاء المشروع
- إذا نسيت كلمة المرور، يمكنك إعادة تعيينها من Settings → Database → Database Password

---

### **الخطوة 7: إضافة DATABASE_URL في Render**

1. في Render Dashboard
2. اضغط على **"Environment"** في القائمة الجانبية
3. اضغط على **"Add Environment Variable"** أو **"+**
4. **Key:** `DATABASE_URL`
5. **Value:** الصق Connection String (مع `?sslmode=require`)
6. **احفظ** التغييرات

---

### **الخطوة 8: أعد تشغيل Backend**

بعد إضافة `DATABASE_URL`:

1. في Render Dashboard
2. اضغط على **"Manual Deploy"** → **"Restart"**
3. أو انتظر حتى يعيد Render تشغيل الخدمة تلقائياً

---

## 🔍 **أين أجد Connection String في Supabase:**

### **الطريقة 1: من Settings → Database**
1. Settings (⚙️) → Database
2. Connection string → URI
3. انسخ PostgreSQL URL

### **الطريقة 2: من Project Settings**
1. Project Settings → Database
2. Connection string
3. انسخ PostgreSQL URL

### **الطريقة 3: من Database Dashboard**
1. Database (من القائمة الجانبية)
2. Settings → Connection string
3. انسخ PostgreSQL URL

---

## ⚠️ **ملاحظات مهمة:**

1. **Password:** إذا نسيت كلمة المرور:
   - Settings → Database → Database Password
   - اضغط على "Reset database password"
   - اختر كلمة مرور جديدة

2. **SSL Mode:** مهم جداً - أضف `?sslmode=require` في النهاية

3. **Connection Pooling:** يمكنك استخدام Connection Pooling URL أيضاً (يبدأ بـ `pooler.supabase.com`)

4. **Security:** لا تشارك Connection String مع أي شخص

---

## 🆘 **إذا واجهت مشاكل:**

### **المشكلة 1: لا أجد Connection String**
- تأكد من أنك في Settings → Database
- ابحث عن "Connection string" أو "Connection pooling"

### **المشكلة 2: نسيت كلمة المرور**
- Settings → Database → Database Password
- اضغط على "Reset database password"

### **المشكلة 3: Connection String لا يعمل**
- تأكد من إضافة `?sslmode=require`
- تأكد من استبدال `[password]` بكلمة المرور الصحيحة

---

## ✅ **ملخص الخطوات:**

1. ✅ افتح مشروع "banda chao" في Supabase
2. ✅ اذهب إلى Settings → Database
3. ✅ ابحث عن "Connection string" → URI
4. ✅ انسخ Connection String
5. ✅ أضف `?sslmode=require` في النهاية
6. ✅ أضف `DATABASE_URL` في Render Environment Variables
7. ✅ احفظ التغييرات
8. ✅ أعد تشغيل Backend

---

**📅 تاريخ:** اليوم  
**✍️ الحالة:** ✅ **جاهز - اتبع الخطوات أعلاه**

