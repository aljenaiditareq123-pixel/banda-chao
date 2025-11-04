# ⚠️ إصلاح خطأ Root Directory

## ❌ **المشكلة:**

```
Service Root Directory "/opt/render/project/src/server" is missing.
cd: /opt/render/project/src/server: No such file or directory
```

**Render يبحث عن `src/server` لكن المجلد الصحيح هو `server` فقط!**

---

## 🔧 **الحل: تحديث Settings**

---

### **الخطوة 1: اذهب إلى Settings**

#### **في الشريط الجانبي الأيسر:**

1. **ابحث عن:** **"Settings"** (تحت "Events")
2. **اضغط على:** **"Settings"**
3. **ستفتح صفحة Settings**

---

### **الخطوة 2: عدّل Root Directory**

#### **في صفحة Settings:**

1. **ابحث عن قسم:** **"Build & Deploy"**
2. **ابحث عن حقل:** **"Root Directory"**
3. **القيمة الحالية (خطأ):**
   ```
   src/server
   ```
   أو
   ```
   /src/server
   ```

4. **غيّرها إلى (صحيح):**
   ```
   server
   ```
   - ✅ **فقط `server`** (بدون `src/` وبدون `/` في البداية)
   - ✅ **لا مسافات**

---

### **الخطوة 3: تحقق من Build Command**

#### **في نفس القسم:**

1. **ابحث عن حقل:** **"Build Command"**
2. **يجب أن يكون:**
   ```
   npm install && npx prisma generate && npm run build
   ```
   - ✅ **لا تكتب `cd server &&`** في البداية
   - ✅ Render داخل `server` بالفعل بسبب Root Directory

---

### **الخطوة 4: تحقق من Start Command**

#### **في نفس القسم:**

1. **ابحث عن حقل:** **"Start Command"**
2. **يجب أن يكون:**
   ```
   npm start
   ```
   - ✅ **لا تكتب `cd server &&`** في البداية

---

### **الخطوة 5: Save Changes**

#### **في أسفل الصفحة:**

1. **ابحث عن زر:** **"Save Changes"**
2. **اضغط عليه**
3. **Render سيبدأ Build جديد تلقائياً**

---

## ✅ **القيم الصحيحة (انسخها كما هي):**

```
Root Directory: server
Build Command: npm install && npx prisma generate && npm run build
Start Command: npm start
```

---

## 📋 **ملخص الخطوات:**

```
1️⃣  Settings (في القائمة الجانبية)
2️⃣  Build & Deploy → Root Directory = server
3️⃣  Build Command = npm install && npx prisma generate && npm run build
4️⃣  Start Command = npm start
5️⃣  Save Changes
```

---

## ✅ **بعد Save:**

### **Render سيبدأ:**

1. ✅ **Clone Repository**
2. ✅ **يذهب إلى `/opt/render/project/server`** (صحيح!)
3. ✅ **npm install**
4. ✅ **npx prisma generate**
5. ✅ **npm run build**
6. ✅ **npm start**

---

## 🎯 **لماذا هذا الحل يعمل:**

### **عند Root Directory = `server`:**

- ✅ Render يبدأ مباشرة من `/opt/render/project/server`
- ✅ لا حاجة لـ `cd server &&` في Commands
- ✅ جميع Commands تعمل داخل `server/` تلقائياً

---

## ⚠️ **ملاحظات مهمة:**

### **Root Directory:**
- ✅ **يجب أن يكون:** `server` فقط
- ❌ **لا تكتب:** `src/server`
- ❌ **لا تكتب:** `/server`
- ❌ **لا تكتب:** `server/`

### **Build Command:**
- ✅ **يجب أن يكون:** `npm install && npx prisma generate && npm run build`
- ❌ **لا تكتب:** `cd server && npm install ...`

### **Start Command:**
- ✅ **يجب أن يكون:** `npm start`
- ❌ **لا تكتب:** `cd server && npm start`

---

**اذهب إلى Settings الآن وأصلح Root Directory!** 🔧

