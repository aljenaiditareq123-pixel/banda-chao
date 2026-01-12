# 🔗 الحصول على Backend URL من Render

## ✅ **تم إضافة جميع Environment Variables!**

---

## 📋 **الخطوة التالية: الحصول على Backend URL**

---

### **الخطوة 1: انتظر حتى يكتمل Deploy**

#### **في Render Dashboard:**

1. **افتح:** `banda-chao` Service
2. **تحقق من:** قسم **"Events"** أو **"Logs"**
3. **انتظر حتى:** Build و Deploy يكتملان
4. **ستجد:** ✅ **"Deploy succeeded"** أو **"Live"**

---

### **الخطوة 2: احصل على Backend URL**

#### **في Render Dashboard:**

1. **افتح:** `banda-chao` Service
2. **في الأعلى:** ستجد URL مثل:
   ```
   https://banda-chao.onrender.com
   ```
   أو
   ```
   https://banda-chao-xxxxx.onrender.com
   ```

3. **انسخ هذا URL** 📋

---

### **الخطوة 3: اختبر Backend URL**

#### **افتح في المتصفح:**

```
https://banda-chao.onrender.com/api/health
```

**يجب أن ترى:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## 📋 **القيم المطلوبة لـ Vercel:**

### **بعد الحصول على Backend URL:**

ستحتاج إلى إضافة Environment Variables في Vercel:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://banda-chao.onrender.com/api/v1` |
| `NEXT_PUBLIC_SOCKET_URL` | `https://banda-chao.onrender.com` |

---

## ✅ **الخطوات التالية:**

1. ✅ **انتظر Deploy يكتمل** (Render Dashboard → Events/Logs)
2. ✅ **احصل على Backend URL** (من أعلى Service)
3. ✅ **اختبر Backend** (`/api/health`)
4. ✅ **أضف Environment Variables في Vercel** (الخطوة التالية)

---

## 🔍 **إذا كان Deploy لا يزال يعمل:**

### **تحقق من:**

- **Events:** راقب Build و Deploy progress
- **Logs:** تحقق من أي أخطاء
- **Metrics:** تحقق من Service status

---

**انتظر حتى يكتمل Deploy واحصل على Backend URL!** 🚀


