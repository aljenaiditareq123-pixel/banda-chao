# 📋 دليل بصري - كيفية الحصول على Internal Database URL

## 🎯 **الخطوة 1: اذهب إلى Database**

### **في Render Dashboard:**

1. **Dashboard** → **ابحث عن `banda-chao-db`** (Database)
2. **اضغط على Database**

---

## 🔍 **الخطوة 2: اذهب إلى Settings**

### **في الـ Sidebar الأيسر:**

1. **Settings** (في الـ Sidebar)
2. **اضغط "Settings"**

---

## 📍 **الخطوة 3: ابحث عن "Connections"**

### **في صفحة Settings:**

**ستجد قسم "Connections" يحتوي على:**

#### **Internal Database URL:**

```
postgresql://username:password@host:port/database
```

**أو:**

```
postgres://username:password@host:port/database
```

---

## 📋 **كيفية النسخ:**

### **الطريقة 1: زر النسخ**

1. **ابحث عن Internal Database URL**
2. **ستجد زر نسخ** (أيقونة copy) بجانب URL
3. **اضغط زر النسخ**
4. **URL تم نسخه!**

---

### **الطريقة 2: نسخ يدوي**

1. **حدد النص** (Internal Database URL)
2. **Ctrl+C** (أو Cmd+C على Mac)
3. **URL تم نسخه!**

---

## ✅ **بعد النسخ:**

### **الخطوة 4: أضف DATABASE_URL في Service**

1. **ارجع للـ Service** (`banda-chao-backend`)
2. **Environment** → **"+ Add"**
3. **Key:** `DATABASE_URL`
4. **Value:** (الصق URL الذي نسخته)
5. **Save**

---

## 📋 **مثال على URL:**

### **Internal Database URL يبدو هكذا:**

```
postgresql://username:password@dpg-xxxxx-a.oregon-postgres.render.com/database_name
```

**أو:**

```
postgres://username:password@dpg-xxxxx-a.oregon-postgres.render.com/database_name
```

---

## 🎯 **أين تجده بالضبط:**

### **في Database Settings:**

**ستجد أقسام مثل:**

- **Connections**
  - Internal Database URL ← **هنا!**
  - External Database URL
- **General**
- **Backups**

---

## ✅ **بعد إضافة DATABASE_URL:**

### **ستحصل على:**

- ✅ DATABASE_URL موجود في Environment Variables
- ✅ Service يمكنه الاتصال بالـ Database
- ✅ Prisma Client سيعمل
- ✅ Service سيعمل

---

**اذهب إلى Database Settings وابحث عن "Internal Database URL"!** 🔍

