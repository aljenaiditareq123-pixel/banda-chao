# 🔧 حل مشكلة non-fast-forward

## ⚠️ **المشكلة:**

**آخر `git push` أظهر:**
```
! [rejected] main -> main (non-fast-forward)
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart.
```

---

## ✅ **الحل: Pull أولاً ثم Push**

---

## 📋 **الخطوات:**

### **1. افتح Terminal**

### **2. اكتب هذه الأوامر بالترتيب:**

```bash
cd /Users/tarqahmdaljnydy/Desktop/banda-chao
```

```bash
git pull origin main --allow-unrelated-histories
```

**إذا طلب Username/Password:**
- **Username:** `aljenaiditareq123-pixel`
- **Password:** `YOUR_TOKEN` (Token الجديد الذي ستنسخه)

---

### **3. بعد Pull الناجح:**

```bash
git push origin main
```

**مرة أخرى، إذا طلب Username/Password:**
- **Username:** `aljenaiditareq123-pixel`
- **Password:** `YOUR_TOKEN` (Token الجديد)

---

## 🎯 **بديل: Force Push (احذر!)**

**⚠️ استخدم فقط إذا كنت متأكداً أنك تريد استبدال الـ remote:**

```bash
git push origin main --force
```

**⚠️ هذا سيحذف commits على الـ remote!**

---

## ✅ **ما الذي يجب أن تراه:**

**بعد `git pull`:**
- ✅ **سترى:** "Merge made by..."
- ✅ **أو:** "Already up to date"

**بعد `git push`:**
- ✅ **سترى:** "Enumerating objects..."
- ✅ **سترى:** "Counting objects..."
- ✅ **سترى:** "Writing objects..."
- ✅ **سترى:** "X commits pushed"

---

## 🚀 **ابدأ الآن:**

**1. اذهب إلى:** https://github.com/settings/tokens

**2. أنشئ Token جديد وانسخه**

**3. في Terminal:**
```bash
cd /Users/tarqahmdaljnydy/Desktop/banda-chao
git pull origin main --allow-unrelated-histories
git push origin main
```

**4. أدخل Username و Token عند الطلب**

---

**أخبرني: هل أنشأت Token جديد؟** 🔍


