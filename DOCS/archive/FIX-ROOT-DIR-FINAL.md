# ⚠️ خطأ Root Directory - حل نهائي

## ❌ **الخطأ:**

```
Service Root Directory "/opt/render/project/src/server" is missing.
cd: /opt/render/project/src/server: No such file or directory
```

Render يبحث عن `/opt/render/project/src/server` لكنه غير موجود.

---

## 🔧 **الحل - جرب بالترتيب:**

---

### **الحل 1: Root Directory = `server` (جرب هذا أولاً)**

#### **في Settings → Build & Deploy:**

1. **Root Directory:**
   - احذف كل شيء
   - اكتب: **`server`** (فقط، بدون مسافات)
   - Save

2. **Build Command:**
   ```
   npm install && npx prisma generate && npm run build
   ```

3. **Start Command:**
   ```
   npm start
   ```

4. **Save Changes**

---

### **الحل 2: Root Directory = فارغ (إذا فشل الحل 1)**

#### **في Settings → Build & Deploy:**

1. **Root Directory:**
   - احذف كل شيء
   - **اتركه فارغاً** ✅

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

### **الحل 3: استخدام render.yaml (الأفضل)**

#### **إذا كان render.yaml موجود في GitHub:**

Render يجب أن يقرأه تلقائياً، لكن إذا لم يفعل:

1. **تأكد أن render.yaml في جذر Repository** (ليس في `server/`)
2. **Render سيقرأه تلقائياً عند Connect**

---

## ✅ **القيم الصحيحة:**

### **الخيار 1 (Root Directory = server):**

```
Root Directory: server
Build Command: npm install && npx prisma generate && npm run build
Start Command: npm start
```

### **الخيار 2 (Root Directory = فارغ):**

```
Root Directory: (فارغ)
Build Command: cd server && npm install && npx prisma generate && npm run build
Start Command: cd server && npm start
```

---

## 📋 **خطوات الإصلاح:**

1. ✅ **Settings** → Build & Deploy
2. ✅ **جرب الحل 1 أولاً:** Root Directory = `server`
3. ✅ **إذا فشل:** جرب الحل 2: Root Directory = فارغ
4. ✅ **Save Changes**
5. ✅ **Redeploy**

---

## 🎯 **الخلاصة:**

### **الأفضل:**
- ✅ **Root Directory:** `server`
- ✅ **Build Command:** `npm install && npx prisma generate && npm run build`
- ✅ **Start Command:** `npm start`

### **إذا فشل:**
- ⚠️ **Root Directory:** فارغ
- ⚠️ **Build Command:** `cd server && npm install && npx prisma generate && npm run build`
- ⚠️ **Start Command:** `cd server && npm start`

---

**جرب الحل 1 أولاً (Root Directory = server)!** 🔧


