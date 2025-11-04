# 🎯 اذهب إلى Service وأضف Environment Variables

## ✅ **الوضع:**

- ✅ أنت في Dashboard الرئيسي
- ✅ Database `banda-chao-db` موجود (Available) ✅

---

## 🎯 **الخطوات:**

---

### **الخطوة 1: ابحث عن Service**

#### **في Dashboard:**

1. **ابحث في قسم "Ungrouped Services"**
2. **ابحث عن:**
   - `banda-chao`
   - أو `banda-chao-backend`
   - أو `anda-chao-backend`

3. **اضغط على اسم Service**

---

### **الخطوة 2: اذهب إلى Database Settings أولاً**

#### **لنسخ Internal Database URL:**

1. **اضغط على `banda-chao-db`** (في قائمة Services)
2. **Settings** (في الـ Sidebar الأيسر)
3. **ابحث عن "Connections"** أو **"Internal Database URL"**
4. **Copy Internal Database URL**
   - اضغط زر النسخ
   - أو انسخ من الحقل

---

### **الخطوة 3: ارجع للـ Service**

#### **في Dashboard:**

1. **اضغط على Service** (banda-chao أو banda-chao-backend)
2. **Settings** → **Environment**

---

### **الخطوة 4: أضف Environment Variables**

#### **في صفحة Environment:**

**أضف:**

1. **DATABASE_URL:**
   - **Key:** `DATABASE_URL`
   - **Value:** (الصق Internal Database URL من الخطوة 2)
   - **Save**

2. **JWT_SECRET:**
   - **Key:** `JWT_SECRET`
   - **Value:** `my-super-secret-jwt-key-12345-67890-abcdef`
   - **Save**

3. **JWT_EXPIRES_IN:**
   - **Key:** `JWT_EXPIRES_IN`
   - **Value:** `7d`
   - **Save**

4. **NODE_ENV:**
   - **Key:** `NODE_ENV`
   - **Value:** `production`
   - **Save**

---

### **الخطوة 5: Manual Deploy**

#### **بعد إضافة جميع Environment Variables:**

1. **ارجع للصفحة الرئيسية للـ Service**
2. **Manual Deploy** → **"Deploy latest commit"**
3. **Build يجب أن ينجح!** ✅

---

## 📋 **ملخص الخطوات:**

```
1️⃣  اضغط على banda-chao-db → Settings → Copy Internal Database URL
2️⃣  اضغط على Service (banda-chao) → Settings → Environment
3️⃣  Add: DATABASE_URL (الصق URL)
4️⃣  Add: JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV
5️⃣  Manual Deploy
```

---

## ✅ **بعد إضافة Environment Variables:**

### **ستحصل على:**

- ✅ DATABASE_URL موجود ✅
- ✅ Service سيعمل ✅
- ✅ **المشروع جاهز!** 🎉

---

**ابحث عن Service في قائمة Services واذهب إلى Settings → Environment!** 🚀

