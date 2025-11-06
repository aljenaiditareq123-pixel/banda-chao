# 🔧 حل مشكلة "divergent branches"

## 🎯 **المشكلة:**

**✅ من Terminal أرى:**
- ❌ **"fatal: Need to specify how to reconcile divergent branches"**
- ❌ **Branches مختلفة (local و remote)**

**✅ الحل:** إعداد merge strategy ثم pull ثم push

---

## 🚀 **الحل (4 خطوات):**

### **الخطوة 1: إعداد merge strategy**

**في Terminal، اكتب:**

```bash
git config pull.rebase false
```

**ثم اضغط Enter**

---

### **الخطوة 2: Pull مع merge**

**في Terminal، اكتب:**

```bash
git pull origin main --allow-unrelated-histories --no-edit
```

**ثم اضغط Enter**

**⚠️ قد يظهر merge message - اضغط `:q` ثم Enter للخروج**

---

### **الخطوة 3: إعادة تعيين remote URL**

**في Terminal، اكتب:**

```bash
git remote set-url origin https://github.com/aljenaiditareq123-pixel/banda-chao.git
```

**ثم اضغط Enter**

---

### **الخطوة 4: Push مع Token**

**في Terminal، اكتب:**

```bash
git push origin main
```

**ثم اضغط Enter**

**⚠️ سيطلب منك:**
- **Username:** `aljenaiditareq123-pixel`
- **Password:** الصق Token (`ghp_XjRVZBYxQ04ugmE8XGiy0j81BAeV013Kjz8g`)

---

## ✅ **ما الذي يجب أن تراه:**

### **بعد الخطوة 2 (pull):**

```
Merge made by the 'recursive' strategy.
```

أو:
```
Already up to date.
```

### **بعد الخطوة 4 (push):**

```
Enumerating objects: ...
Counting objects: ...
Writing objects: ...
To https://github.com/aljenaiditareq123-pixel/banda-chao.git
   xxxxx..xxxxx  main -> main
```

---

## 🎯 **الخطوات الكاملة:**

**1. افتح Terminal**

**2. اكتب:**
```bash
cd /Users/tarqahmdaljnydy/Desktop/banda-chao
```

**3. اكتب:**
```bash
git config pull.rebase false
```

**4. اكتب:**
```bash
git pull origin main --allow-unrelated-histories --no-edit
```

**5. إذا ظهر vim editor:**
- اضغط `:q` ثم Enter

**6. اكتب:**
```bash
git remote set-url origin https://github.com/aljenaiditareq123-pixel/banda-chao.git
```

**7. اكتب:**
```bash
git push origin main
```

**8. أدخل Username:** `aljenaiditareq123-pixel`

**9. أدخل Password (Token):** `ghp_XjRVZBYxQ04ugmE8XGiy0j81BAeV013Kjz8g`

---

## ⚠️ **مهم:**

- ✅ **Token يجب أن يكون كاملاً** (يبدأ بـ `ghp_`)
- ✅ **عندما يطلب Password، الصق Token** (ليس كلمة المرور)
- ✅ **انتظر حتى يكتمل** (~1-2 دقيقة)

---

## 🚀 **ابدأ الآن:**

**اتبع الخطوات أعلاه بالترتيب!**

---

**هذا سيحل المشكلة!** 🚀

