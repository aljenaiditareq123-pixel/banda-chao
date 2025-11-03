# ✅ إصلاح واحد نهائي - Render

## 🎯 **انسخ هذه القيم بالضبط:**

---

## 📋 **في Render Settings:**

### **1. Root Directory:**
```
server
```

---

### **2. Build Command:**
```
npm install && npx prisma generate && npm run build
```

---

### **3. Start Command:**
```
npm start
```

---

## ⚠️ **مهم:**
- **لا تكتب `cd server &&`**
- **Render داخل `server` بالفعل**

---

## 💾 **بعد التعديل:**
1. **Save Changes**
2. Render سيبدأ Build جديد

---

## 🗄️ **بعد Save (إنشاء Database):**

### **New → PostgreSQL:**
- Name: `banda-chao-db`
- Plan: Free
- Region: Oregon

### **Environment Variables (بعد إنشاء Database):**
- `DATABASE_URL` = (Database URL)
- `NODE_ENV` = `production`
- `JWT_SECRET` = `banda-chao-secret-key-2025`
- `JWT_EXPIRES_IN` = `7d`
- `FRONTEND_URL` = `http://localhost:3000`

---

**انسخ الأوامر واكتبها في Settings!** ✅

