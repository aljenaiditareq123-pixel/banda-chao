# 🚀 Manual Deploy - Deploy latest commit

## ❌ **المشكلة:**

**Render ما زال يستخدم commit قديم:** `8e92396` ("Initial commit - Core files")

**هذا commit لا يحتوي على مجلد `server`!**

---

## 🔧 **الحل: Manual Deploy**

---

### **الخطوة 1: اذهب إلى Render Dashboard**

1. **في صفحة Events الحالية**
2. **ابحث عن زر:** **"Manual Deploy"** أو **"Deploy"**

---

### **الخطوة 2: اضغط Manual Deploy**

#### **في Render Dashboard:**

1. **ابحث عن زر:** **"Manual Deploy"** (عادة في الأعلى أو في Events)
2. **أو اضغط:** **"Deploy"** في شريط الأدوات
3. **اختر:** **"Deploy latest commit"** أو **"Deploy"**

---

### **الخطوة 3: انتظر Build**

**Render سيستخدم آخر commit الذي يحتوي على `server`!**

---

## 📋 **الخطوات:**

```
1️⃣  Render Dashboard → Events (أنت هنا الآن)
2️⃣  ابحث عن زر "Manual Deploy" أو "Deploy"
3️⃣  اضغط "Deploy latest commit"
4️⃣  انتظر Build يكتمل
```

---

## ✅ **بعد Deploy latest commit:**

1. ✅ **Render سيستخدم آخر commit** (`d64ed12` أو أحدث)
2. ✅ **سيجد مجلد `server`**
3. ✅ **Build سينجح!**

---

## 🔍 **أين زر Manual Deploy؟**

### **في Render Dashboard:**

- **في الأعلى:** شريط أدوات → زر **"Deploy"** أو **"Manual Deploy"**
- **في Events:** بجانب آخر Deploy → زر **"Deploy"**
- **في Settings:** قسم Deploy → **"Manual Deploy"**

---

## 💡 **إذا لم تجد زر Manual Deploy:**

### **الحل البديل: Push إلى GitHub**

إذا كان آخر commit غير موجود في GitHub:

```bash
cd /Users/tarqahmdaljnydy/Desktop/banda-chao
git push origin main
```

ثم Render سيبدأ Build جديد تلقائياً.

---

**ابحث عن زر "Manual Deploy" أو "Deploy" واضغط عليه!** 🚀

