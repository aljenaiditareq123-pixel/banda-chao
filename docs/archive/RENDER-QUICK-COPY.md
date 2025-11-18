# 📋 نسخ سريع - Render Setup

## 🔑 **JWT Secret (أنشئته لك):**

انسخ هذا:
```
$(openssl rand -base64 32)
```

أو استخدم أي مفتاح طويل (32+ حرف)

---

## 📝 **Environment Variables - انسخ هذا:**

### **في Render Web Service:**

```
JWT_SECRET = [الصق المفتاح من أعلى]
JWT_EXPIRES_IN = 7d
FRONTEND_URL = https://banda-chao.vercel.app
NODE_ENV = production
DATABASE_URL = [من PostgreSQL Database]
```

---

## 🔧 **Build Commands - انسخ هذا:**

**Build Command:**
```
npm install && npx prisma generate && npm run build
```

**Start Command:**
```
npm start
```

---

## 📍 **Root Directory:**
```
server
```

---

**كل شيء جاهز للنسخ واللصق!** 🚀


