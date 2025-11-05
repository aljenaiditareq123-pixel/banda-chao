# 🚀 استخدم GitHub CLI أو Terminal الآن

## ⚠️ **المشكلة:**

**Terminal لا يستطيع قراءة Username/Password بدون تفاعل.**

---

## ✅ **الحل: استخدام GitHub CLI (أسهل)**

---

## 📋 **الخطوات:**

### **1. افتح Terminal**

### **2. ثبت GitHub CLI (إذا لم يكن مثبتاً):**

```bash
brew install gh
```

**إذا لم يكن `brew` مثبتاً:**
- اذهب إلى: https://brew.sh
- انسخ الأمر: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`

---

### **3. سجل دخول مع Token:**

```bash
gh auth login
```

**اختر:**
- ✅ **GitHub.com**
- ✅ **HTTPS**
- ✅ **Login with a web browser** (أو **Paste token**)
- ✅ **Paste token:** `ghp_I7oRchBSmAqIUtHscKhPr9isoooNA83K0Rvn`

---

### **4. Push:**

```bash
cd /Users/tarqahmdaljnydy/Desktop/banda-chao
git push origin main
```

---

## 🎯 **بديل: استخدام Terminal مباشرة (مع تفاعل)**

### **في Terminal:**

```bash
cd /Users/tarqahmdaljnydy/Desktop/banda-chao
git remote set-url origin https://github.com/aljenaiditareq123-pixel/banda-chao.git
git push origin main
```

**عندما يطلب Username:**
- ✅ **اكتب:** `aljenaiditareq123-pixel`
- ✅ **اضغط Enter**

**عندما يطلب Password:**
- ✅ **اكتب:** `ghp_I7oRchBSmAqIUtHscKhPr9isoooNA83K0Rvn`
- ✅ **اضغط Enter**

---

## ✅ **ما الذي يجب أن تراه:**

**بعد `git push origin main`:**
- ✅ **سترى:** "Enumerating objects..."
- ✅ **سترى:** "Counting objects..."
- ✅ **سترى:** "Writing objects..."
- ✅ **سترى:** "28 commits pushed" (أو عدد مشابه)

---

## 🚀 **ابدأ الآن:**

**اختر طريقة:**
1. ✅ **GitHub CLI** (أسهل - `gh auth login`)
2. ✅ **Terminal مباشرة** (مع تفاعل - Username/Password)

---

**أخبرني: أي طريقة تريد استخدامها؟** 🔍

