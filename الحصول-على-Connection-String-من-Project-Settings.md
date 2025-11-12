# 🔗 الحصول على Connection String من Project Settings

**الموقع الحالي:** Database → Settings  
**الموقع المطلوب:** Project Settings → Database → Connection string

---

## 📋 **الخطوات:**

### **الخطوة 1: اذهب إلى Project Settings**

1. في القائمة الجانبية (اليسار)
2. ابحث عن أيقونة **Settings** (⚙️) في الأسفل
3. اضغط عليها
4. أو من القائمة العلوية، اضغط على **"Settings"** → **"General"**

---

### **الخطوة 2: اذهب إلى Database من Project Settings**

في صفحة Project Settings:

1. في القائمة الجانبية (اليسار) داخل Project Settings
2. ابحث عن قسم **"CONFIGURATION"**
3. اضغط على **"Database"** (مع أيقونة external link 🔗)
4. سيتم فتح صفحة Database Connection Settings

---

### **الخطوة 3: احصل على Connection String**

في صفحة Database Connection Settings:

1. ابحث عن قسم **"Connection string"** أو **"Connection pooling"**
2. ستجد عدة خيارات:
   - **URI** (هذا ما نحتاجه)
   - **JDBC**
   - **Connection pooling**
3. اضغط على **"URI"** أو **"Connection string"**
4. ستظهر Connection String

---

## 🔍 **بديل: من القائمة العلوية**

1. في القائمة العلوية (Breadcrumbs)
2. اضغط على **"banda chao"** (بجانب Production)
3. ثم اذهب إلى **Settings** → **Database**

---

## 📝 **ملاحظات:**

- **Database Settings** (التي أنت فيها الآن) = إعدادات قاعدة البيانات
- **Project Settings → Database** = Connection String
- نحتاج **Project Settings → Database** للحصول على Connection String

---

## 🗺️ **الطريق الصحيح:**

```
Database → Settings (أنت هنا)
  └── اذهب إلى Settings (⚙️) في القائمة الجانبية
      └── Project Settings
          └── CONFIGURATION
              └── Database (🔗) ← اضغط هنا
                  └── Connection string → URI
```

---

## 🔄 **الطريقة السريعة:**

1. من القائمة العلوية (Breadcrumbs)
2. اضغط على **"banda chao"** (بجانب Production)
3. ثم **Settings** → **Database** → **Connection string**

---

**📅 تاريخ:** اليوم  
**✍️ الحالة:** ✅ **جاهز - اتبع الخطوات أعلاه**


