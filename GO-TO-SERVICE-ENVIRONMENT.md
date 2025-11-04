# 🔄 العودة للصفحة الصحيحة - Service Environment

## ⚠️ **الوضع:**

- ⚠️ أنت في صفحة "New Environment Group" (خطأ)
- ✅ تحتاج إلى صفحة **Environment** للـ Service

---

## 🎯 **الحل:**

### **الخطوة 1: ارجع للـ Service**

#### **في Render Dashboard:**

1. **Dashboard** → **ابحث عن Service `banda-chao-backend`**
   - أو اضغط على اسم Service من قائمة Services

2. **اضغط على Service `banda-chao-backend`**

---

### **الخطوة 2: اذهب إلى Environment**

#### **في الـ Sidebar الأيسر:**

1. **ابحث عن "Environment"** في قسم **"MANAGE"**
2. **اضغط "Environment"**

---

### **الخطوة 3: إضافة Environment Variables**

#### **في صفحة Environment للـ Service:**

**ستجد قائمة Environment Variables أو زر "Add Environment Variable"**

**أضف:**

1. **DATABASE_URL:**
   - **Key:** `DATABASE_URL`
   - **Value:** (من Database Settings - سنأخذه لاحقاً)

2. **JWT_SECRET:**
   - **Key:** `JWT_SECRET`
   - **Value:** `my-super-secret-jwt-key-12345-67890-abcdef`

3. **JWT_EXPIRES_IN:**
   - **Key:** `JWT_EXPIRES_IN`
   - **Value:** `7d`

4. **NODE_ENV:**
   - **Key:** `NODE_ENV`
   - **Value:** `production`

---

## 📋 **الخطوات الكاملة:**

```
1️⃣  Dashboard → banda-chao-backend (Service)
2️⃣  Sidebar → Environment (في قسم MANAGE)
3️⃣  Add Environment Variables
4️⃣  نسخ Internal Database URL من Database
5️⃣  إضافة DATABASE_URL
6️⃣  Manual Deploy
```

---

## ✅ **الفرق:**

### **❌ خطأ:**
- "New Environment Group" → هذا لإنشاء مجموعة جديدة

### **✅ صحيح:**
- Service → Settings → Environment → Add Variables
- هذا لإضافة Environment Variables للـ Service مباشرة

---

## 💡 **نصيحة:**

### **الطريقة الأسهل:**

1. **Dashboard** → **ابحث عن `banda-chao-backend`**
2. **اضغط على Service**
3. **Settings** → **Environment** (في الـ Sidebar)

---

**ارجع للـ Dashboard واضغط على Service `banda-chao-backend`!** 🔄

