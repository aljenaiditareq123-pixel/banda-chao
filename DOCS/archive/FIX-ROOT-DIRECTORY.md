# ⚠️ خطأ: Root Directory is missing - الحل النهائي

## ❌ **الخطأ:**

```
Service Root Directory "/opt/render/project/src/server" is missing.
cd: /opt/render/project/src/server: No such file or directory
```

---

## 💡 **السبب:**

Render يبحث عن `src/server` بدلاً من `server` فقط.

---

## 🔧 **الحل:**

### **الخطوة 1: Root Directory**

#### **في Settings → Build & Deploy:**

1. ابحث عن **"Root Directory"**
2. **احذف كل شيء** في الحقل
3. **اكتب بالضبط:**
   ```
   server
   ```
4. **⚠️ مهم:**
   - ✅ **صحيح:** `server`
   - ❌ **خطأ:** `src/server`
   - ❌ **خطأ:** `/server`
   - ❌ **خطأ:** `server/`

---

### **الخطوة 2: Build Command**

#### **ابحث عن "Build Command":**

1. اضغط **"Edit"** (✏️)
2. **احذف كل شيء**
3. **اكتب بالضبط:**
   ```
   npm install && npx prisma generate && npm run build
   ```
4. **⚠️ مهم:**
   - ❌ **لا تكتب:** `cd server && npm install`
   - ✅ **اكتب:** `npm install && npx prisma generate && npm run build`

---

### **الخطوة 3: Start Command**

#### **ابحث عن "Start Command":**

1. اضغط **"Edit"** (✏️)
2. **احذف كل شيء**
3. **اكتب بالضبط:**
   ```
   npm start
   ```
4. **⚠️ مهم:**
   - ❌ **لا تكتب:** `cd server && npm start`
   - ✅ **اكتب:** `npm start`

---

### **الخطوة 4: Save Changes**

#### **في أسفل صفحة Settings:**

1. اضغط **"Save Changes"**
2. Render سيبدأ Build جديد تلقائياً

---

## ✅ **القيم الصحيحة (انسخها كما هي):**

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

## ⚠️ **تحذيرات مهمة:**

### **❌ لا تفعل:**
- ❌ لا تكتب `src/server` في Root Directory
- ❌ لا تكتب `cd server &&` في الأوامر
- ❌ لا تضع مسافات إضافية

### **✅ افعل:**
- ✅ `server` فقط (Root Directory)
- ✅ `npm install && npx prisma generate && npm run build` (Build Command)
- ✅ `npm start` (Start Command)

---

## 📋 **خطوات الإصلاح:**

1. ✅ **Settings** → Root Directory = `server` (فقط!)
2. ✅ **Build Command** = `npm install && npx prisma generate && npm run build`
3. ✅ **Start Command** = `npm start`
4. ✅ **Save Changes**
5. ✅ **Redeploy** (سيبدأ تلقائياً)

---

**اذهب إلى Settings وأصلح Root Directory الآن!** 🔧


