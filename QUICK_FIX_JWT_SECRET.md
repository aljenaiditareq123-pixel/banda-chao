# ⚡ إصلاح سريع: JWT_SECRET Missing

**تاريخ:** 27 ديسمبر 2024

---

## 🎯 الحل السريع:

### **في Render Dashboard:**

1. **اذهب إلى:** `banda-chao` (Backend Service) → **Environment**

2. **ابحث عن:** `JWT_SECRET`

3. **إذا كان موجوداً:**
   - ✅ أعد تشغيل Backend Service فقط
   - اذهب إلى `banda-chao` → اضغط **"Restart"**

4. **إذا لم يكن موجوداً:**
   - اضغط **"+ Add Environment Variable"**
   - **Key:** `JWT_SECRET`
   - **Value:** `Jk89sfd789ASFD789asfd789KLJ3241kjASDF789`
   - اضغط **"Save Changes"**
   - أعد تشغيل Backend Service

---

## ✅ القيمة المطلوبة:

```
JWT_SECRET = Jk89sfd789ASFD789asfd789KLJ3241kjASDF789
```

---

## 🔄 بعد الإصلاح:

1. **أعد تشغيل Backend Service**
2. **انتظر 30-60 ثانية**
3. **جرّب Login مرة أخرى**

---

**🚨 الحل السريع: أضف `JWT_SECRET` في Backend Environment ثم أعد تشغيل Backend!** ⚠️
