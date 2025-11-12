# ⚠️ إصلاح عاجل - Render Settings

## ❌ **المشكلة:**

```
Service Root Directory "/opt/render/project/src/server" is missing.
```

Render ما زال يبحث عن `src/server` بدلاً من `server`!

---

## 🔧 **الحل - تحديث Settings يدوياً:**

### **الخطوات:**

#### **1. اذهب إلى Settings:**

Render Dashboard → Service `anda-chao-backend` → **Settings**

---

#### **2. ابحث عن قسم "Build & Deploy":**

- **قم بالتمرير لأسفل** في صفحة Settings
- **ابحث عن:**
  - "Build & Deploy"
  - أو "Build Command"
  - أو "Start Command"

---

#### **3. Root Directory:**

- **إذا وجدت حقل "Root Directory":**
  - تأكد أنه يحتوي على: `server` فقط
  - **لا** `src/server`
  - **لا** `/server`
  - **لا** `server/`

---

#### **4. Build Command:**

- **اضغط "Edit"** بجانب "Build Command"
- **احذف كل شيء** في الحقل
- **اكتب بالضبط:**
  ```
  npm install && npx prisma generate && npm run build
  ```
- **⚠️ مهم:** لا تكتب `cd server &&` في البداية

---

#### **5. Start Command:**

- **اضغط "Edit"** بجانب "Start Command"
- **احذف كل شيء** في الحقل
- **اكتب بالضبط:**
  ```
  npm start
  ```
- **⚠️ مهم:** لا تكتب `cd server &&` في البداية

---

#### **6. Save Changes:**

- **اضغط "Save Changes"** في أسفل الصفحة
- أو **"Update"** أو **"Apply"**

---

## ✅ **القيم الصحيحة (انسخها كما هي):**

```
Root Directory: server
Build Command: npm install && npx prisma generate && npm run build
Start Command: npm start
```

---

## 🚀 **بعد Save:**

1. **ارجع للصفحة الرئيسية**
2. **Manual Deploy** → **"Deploy latest commit"**
3. Build يجب أن يعمل الآن! ✅

---

## 💡 **لماذا هذا الحل:**

### **عند Root Directory = `server`:**
- ✅ Render يبدأ مباشرة من `/opt/render/project/server`
- ✅ سيجد `package.json`
- ✅ سيجد `prisma/schema.prisma`
- ✅ **لا** `src/` مضاف تلقائياً

---

## ⚠️ **إذا استمرت المشكلة:**

### **حل بديل - حذف وإعادة إنشاء Service:**

1. **Settings** → **Danger Zone** → **Delete Service**
2. **New** → **Web Service**
3. **Connect GitHub Repository:** `banda-chao`
4. Render **سيقرأ `render.yaml` تلقائياً** عند الإنشاء

---

**اذهب إلى Settings الآن وحدث القيم!** 🔧


