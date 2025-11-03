# ✅ Settings - تحقق من Build & Deploy

## 📋 **أنت في صفحة Settings!**

---

## 📝 **الخطوات:**

### **1. انزل للأسفل:**

#### **في صفحة Settings:**
- استخدم عجلة الماوس أو اسحب للأسفل
- ابحث عن قسم **"Build & Deploy"**

---

### **2. في قسم "Build & Deploy":**

#### **ابحث عن هذه الحقول:**

**1. Root Directory:**
- يجب أن يكون: **`server`**
- إذا كان فارغاً أو خاطئاً:
  - اضغط **"Edit"**
  - احذف كل شيء
  - اكتب: **`server`**
  - **Save**

**2. Build Command:**
- يجب أن يكون:
  ```
  npm install && npx prisma generate && npm run build
  ```
- إذا كان خاطئاً:
  - اضغط **"Edit"**
  - احذف كل شيء
  - اكتب بالضبط:
    ```
    npm install && npx prisma generate && npm run build
    ```
  - **Save**

**3. Start Command:**
- يجب أن يكون:
  ```
  npm start
  ```
- إذا كان خاطئاً:
  - اضغط **"Edit"**
  - احذف كل شيء
  - اكتب بالضبط:
    ```
    npm start
    ```
  - **Save**

---

### **3. Save Changes:**

#### **في أسفل صفحة Settings:**
- بعد تعديل جميع الحقول
- اضغط **"Save Changes"** (الزر الأسود)
- Render سيبدأ Build جديد تلقائياً

---

## ✅ **القيم الصحيحة:**

### **Root Directory:**
```
server
```

### **Build Command:**
```
npm install && npx prisma generate && npm run build
```

### **Start Command:**
```
npm start
```

---

## ⚠️ **مهم:**

### **❌ لا تكتب:**
- ❌ `cd server && npm install`
- ❌ `npm install && npm run build` (ناقص prisma generate)

### **✅ اكتب بالضبط:**
- ✅ `server` (Root Directory)
- ✅ `npm install && npx prisma generate && npm run build` (Build Command كامل)
- ✅ `npm start` (Start Command)

---

## 📋 **ملخص:**

1. ✅ **انزل للأسفل** → "Build & Deploy"
2. ✅ **Root Directory:** `server`
3. ✅ **Build Command:** `npm install && npx prisma generate && npm run build`
4. ✅ **Start Command:** `npm start`
5. ✅ **Save Changes**

---

**انزل للأسفل وابحث عن "Build & Deploy" الآن!** 🔧

