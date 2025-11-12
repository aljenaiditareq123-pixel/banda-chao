# ✅ إضافة Environment Variables الآن!

## ✅ **الوضع:**

- ✅ أنت في صفحة **Environment** للـ Service `banda-chao-backend` ✅
- ✅ قسم "Environment Variables" ظاهر

---

## 🎯 **الخطوات:**

---

### **الخطوة 1: نسخ Internal Database URL أولاً**

#### **من Database:**

1. **افتح تبويب جديد** أو **Dashboard**
2. **ابحث عن `banda-chao-db`** (Database)
3. **اضغط على Database**
4. **Settings** → **ابحث عن "Connections"** أو **"Internal Database URL"**
5. **Copy Internal Database URL**
   - اضغط زر النسخ
   - احفظه مؤقتاً

---

### **الخطوة 2: إضافة Environment Variables**

#### **في صفحة Environment الحالية:**

**ستجد زر "+ Add"** بجانب "Environment Variables"

**اضغط "+ Add"**

---

### **الخطوة 3: أضف المتغيرات واحدة تلو الأخرى**

#### **1. DATABASE_URL:**

- **Key:** `DATABASE_URL`
- **Value:** (الصق Internal Database URL من الخطوة 1)
- **Save** أو **Add**

---

#### **2. JWT_SECRET:**

- **Key:** `JWT_SECRET`
- **Value:** `my-super-secret-jwt-key-12345-67890-abcdef`
- **Save** أو **Add**

---

#### **3. JWT_EXPIRES_IN:**

- **Key:** `JWT_EXPIRES_IN`
- **Value:** `7d`
- **Save** أو **Add**

---

#### **4. NODE_ENV:**

- **Key:** `NODE_ENV`
- **Value:** `production`
- **Save** أو **Add**

---

### **الخطوة 4: Manual Deploy**

#### **بعد إضافة جميع Environment Variables:**

1. **ارجع للصفحة الرئيسية:**
   - اضغط **"Events"** في الـ Sidebar

2. **Manual Deploy:**
   - اضغط **"Manual Deploy"** في الأعلى
   - اضغط **"Deploy latest commit"**

3. **Build يجب أن ينجح!** ✅

---

## 📋 **ملخص Environment Variables المطلوبة:**

```
DATABASE_URL = (من Database Settings)
JWT_SECRET = my-super-secret-jwt-key-12345-67890-abcdef
JWT_EXPIRES_IN = 7d
NODE_ENV = production
```

---

## ✅ **بعد إضافة Environment Variables:**

### **ستحصل على:**

- ✅ DATABASE_URL موجود ✅
- ✅ Prisma Client سيعمل ✅
- ✅ Service سيعمل ✅
- ✅ **المشروع جاهز!** 🎉

---

## 💡 **إذا لم تجد Internal Database URL:**

### **ابحث في Database Settings عن:**

- "Connections"
- "Internal Database URL"
- "Database URL"
- "Connection String"

**عادة يكون في:**
- Database → Settings → Connections

---

**اضغط "+ Add" وأضف Environment Variables الآن!** 🚀


