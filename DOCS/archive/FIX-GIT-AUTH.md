# 🔧 إصلاح مشكلة Git Authentication

## ⚠️ **المشكلة:**

Git لا يقبل Token! "Password authentication is not supported"

---

## 🚀 **الحل - طريقة مباشرة:**

### **استخدم Token مباشرة في URL:**

```bash
cd /Users/tarqahmdaljnydy/Desktop/banda-chao

# غيّر Remote URL ليشمل Token
git remote set-url origin https://aljenaiditareq123-pixel:ghp_EekXNxV7eqKcmWqiFC7m8BrFkJDAN03FBJdi@github.com/aljenaiditareq123-pixel/banda-chao.git

# الآن ارفع بدون username/password
git push -u origin main
```

⚠️ **تأكد من Token صحيح من GitHub!**

---

## 🔍 **إذا Token غير صحيح:**

### **1. اذهب لـ GitHub:**
```
https://github.com/settings/tokens
```

### **2. تحقق:**
- Token موجود؟
- Token لم ينتهي؟
- Token له scope `repo`؟

### **3. إذا لم يعمل، أنشئ Token جديد:**
- Delete القديم
- Generate new token
- **انسخ Token الجديد**

---

## 🔄 **أو استخدم GitHub Desktop:**

### **الأسهل:**

1. **افتح GitHub Desktop**
2. **File → Add Local Repository**
3. **اختر:** `/Users/tarqahmdaljnydy/Desktop/banda-chao`
4. **Publish repository** ← سيستخدم Desktop credentials

---

## ✅ **بعد رفع الكود:**

1. ارجع لـ Render Dashboard
2. Public Git Repository
3. URL: `https://github.com/aljenaiditareq123-pixel/banda-chao.git`
4. Connect ← سيعمل! ✅

---

**جرب الطريقة الأولى أو استخدم GitHub Desktop!** 🚀


