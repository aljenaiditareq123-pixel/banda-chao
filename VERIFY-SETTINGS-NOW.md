# ✅ Verify Settings - أكمل الإعداد

## 📋 **نافذة "Verify Settings":**

---

## 📝 **الخطوات:**

### **1. Root Directory:**

#### **في حقل "Root Directory" (الآن فارغ):**

1. **اكتب بالضبط:**
   ```
   server
   ```
2. **⚠️ مهم:**
   - ✅ **صحيح:** `server`
   - ❌ **خطأ:** `src/server`
   - ❌ **خطأ:** `/server`
   - ❌ **خطأ:** `server/`

---

### **2. Build Command:**

#### **الآن:**
```
npm install && npx prisma generate && npm run build
```

**✅ هذا صحيح - لا تغيره!**

---

### **3. Start Command:**

#### **الآن:**
```
node dist/index.js
```

#### **غيّره إلى:**
```
npm start
```

**السبب:** `package.json` يحتوي على script `start` الذي يستخدم `node dist/index.js`، لكن الأفضل استخدام `npm start` لأنه يستخدم script من `package.json`.

---

### **4. Update Fields:**

#### **بعد تعديل القيم:**

1. اضغط **"Update Fields"** (الزر الأسود في الأسفل)
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

## 📋 **ملخص:**

1. ✅ **Root Directory:** `server`
2. ✅ **Build Command:** `npm install && npx prisma generate && npm run build` (لا تغيره)
3. ✅ **Start Command:** `npm start` (غيّره)
4. ✅ **Update Fields** (اضغط الزر الأسود)

---

**أكمل الإعداد واضغط "Update Fields" الآن!** 🚀


