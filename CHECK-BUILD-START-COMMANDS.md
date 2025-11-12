# ✅ تحقق من Build Command و Start Command

## ✅ **Root Directory = `server` (صحيح!)**

---

## 🔍 **الخطوة التالية: تحقق من Build & Start Commands**

---

### **الخطوة 1: ابحث عن قسم "Build & Deploy"**

#### **في صفحة Settings:**

1. **قم بالتمرير لأسفل** في صفحة Settings
2. **ابحث عن قسم:** **"Build & Deploy"**
3. **أو ابحث عن:** **"Build Command"** و **"Start Command"**

---

### **الخطوة 2: تحقق من Build Command**

#### **يجب أن يكون:**

```
npm install && npx prisma generate && npm run build
```

**⚠️ تأكد من:**
- ✅ **لا `cd server &&`** في البداية
- ✅ **لا `server/ $`** في البداية
- ✅ **يبدأ مباشرة بـ `npm install`**

---

### **الخطوة 3: تحقق من Start Command**

#### **يجب أن يكون:**

```
npm start
```

**⚠️ تأكد من:**
- ✅ **لا `cd server &&`** في البداية
- ✅ **لا `server/ $`** في البداية
- ✅ **يبدأ مباشرة بـ `npm start`**

---

## 🔧 **إذا كانت Commands خاطئة:**

### **الحل:**

1. **اضغط "Edit"** بجانب Build Command
2. **احذف كل شيء**
3. **اكتب:**
   ```
   npm install && npx prisma generate && npm run build
   ```
4. **Save**

---

5. **اضغط "Edit"** بجانب Start Command
6. **احذف كل شيء**
7. **اكتب:**
   ```
   npm start
   ```
8. **Save**

---

## 📋 **القيم الصحيحة الكاملة:**

```
Root Directory: server
Build Command: npm install && npx prisma generate && npm run build
Start Command: npm start
```

---

## ✅ **بعد التأكد من جميع القيم:**

1. **Save Changes** (إذا قمت بتعديل أي شيء)
2. **Manual Deploy** → **Deploy latest commit**
3. **راقب Build progress**

---

## 🔍 **إذا كانت جميع القيم صحيحة لكن لا يزال يفشل:**

### **الحل البديل: اترك Root Directory فارغاً:**

1. **Root Directory:**
   - **احذف:** `server`
   - **اتركه فارغاً تماماً** ✅

2. **Build Command:**
   ```
   cd server && npm install && npx prisma generate && npm run build
   ```

3. **Start Command:**
   ```
   cd server && npm start
   ```

4. **Save Changes**

---

## 📋 **خياران:**

---

### **الخيار 1: Root Directory = `server` (جرب هذا أولاً)**

```
Root Directory: server
Build Command: npm install && npx prisma generate && npm run build
Start Command: npm start
```

---

### **الخيار 2: Root Directory = فارغ (إذا فشل الخيار 1)**

```
Root Directory: (فارغ)
Build Command: cd server && npm install && npx prisma generate && npm run build
Start Command: cd server && npm start
```

---

**قم بالتمرير لأسفل وتحقق من Build Command و Start Command!** 🔍


