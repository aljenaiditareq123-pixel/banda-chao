# ✅ إضافة Environment Variables - خطوة بخطوة

## ✅ **الوضع:**

- ✅ أنت في صفحة **Environment Variables** ✅
- ✅ زر "+ Add" ظاهر

---

## 🎯 **الخطوات:**

---

### **الخطوة 1: نسخ Internal Database URL أولاً**

#### **قبل إضافة Environment Variables:**

1. **افتح تبويب جديد** أو **Dashboard**
2. **ابحث عن `banda-chao-db`** (Database)
3. **اضغط على Database**
4. **Settings** → **ابحث عن "Connections"** أو **"Internal Database URL"**
5. **Copy Internal Database URL**
   - اضغط زر النسخ
   - احفظه مؤقتاً

---

### **الخطوة 2: إضافة DATABASE_URL (الأهم!)**

#### **في صفحة Environment الحالية:**

1. **اضغط "+ Add"** بجانب "Environment Variables"

2. **ستظهر نافذة أو حقلين:**
   - **Key:** اكتب `DATABASE_URL`
   - **Value:** (الصق Internal Database URL من الخطوة 1)

3. **Save** أو **Add**

---

### **الخطوة 3: إضافة Environment Variables الأخرى**

#### **أضف واحدة تلو الأخرى:**

**1. JWT_SECRET:**
- اضغط "+ Add" مرة أخرى
- **Key:** `JWT_SECRET`
- **Value:** `my-super-secret-jwt-key-12345-67890-abcdef`
- **Save**

**2. JWT_EXPIRES_IN:**
- اضغط "+ Add"
- **Key:** `JWT_EXPIRES_IN`
- **Value:** `7d`
- **Save**

**3. NODE_ENV:**
- اضغط "+ Add"
- **Key:** `NODE_ENV`
- **Value:** `production`
- **Save**

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
DATABASE_URL = (من Database Settings - الأهم!)
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

**ابدأ بالخطوة 1: نسخ Internal Database URL!** 🚀

