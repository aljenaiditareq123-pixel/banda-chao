# 🔧 تصحيحات Environment Variables - إجراء فوري
# Fix Environment Variables - Immediate Action

**المفتاح الموحد:** `2Xx6uvc8Js8BS2FCu8a9UF9axMgzfX4WcjwFG/87jS8=`

---

## 🔴 Frontend (banda-chao-frontend) - التصحيحات

### ❌ DELETE (احذف):
```
JWT_SECRET
```
**السبب:** يجب أن يكون في Backend فقط.

---

### ✅ KEEP (احتفظ - صحيح):
- `AUTH_SECRET` = `2Xx6uvc8Js8BS2FCu8a9UF9axMgzfX4WcjwFG/87jS8=` ✅
- `NEXTAUTH_SECRET` = `2Xx6uvc8Js8BS2FCu8a9UF9axMgzfX4WcjwFG/87jS8=` ✅
- باقي المتغيرات ✅

---

## 🔴 Backend (banda-chao) - التصحيحات

### 🔄 UPDATE (غيّر إلى):

```
AUTH_SECRET = 2Xx6uvc8Js8BS2FCu8a9UF9axMgzfX4WcjwFG/87jS8=
```
**القيمة الحالية:** `MySuperSecretKey_2025_BandaChao_Founder_Secure_Token` ❌

```
NEXTAUTH_SECRET = 2Xx6uvc8Js8BS2FCu8a9UF9axMgzfX4WcjwFG/87jS8=
```
**القيمة الحالية:** `MySuperSecretKey_2025_BandaChao_Founder_Secure_Token` ❌

---

### ✅ KEEP (احتفظ - صحيح):
- `JWT_SECRET` = `2Xx6uvc8Js8BS2FCu8a9UF9axMgzfX4WcjwFG/87jS8=` ✅
- باقي المتغيرات ✅

---

### ⚠️ STRIPE (قرارك):

**المشكلة:** `STRIPE_MODE = production` لكن Keys هي Test.

**الخيار 1 - Test Mode (مُوصى به الآن):**
```
STRIPE_MODE = test
STRIPE_SECRET_KEY = sk_test_... (Keep)
STRIPE_PUBLISHABLE_KEY = pk_test_... (Keep)
```

**الخيار 2 - Live Mode (إذا جاهز):**
```
STRIPE_MODE = production
STRIPE_SECRET_KEY = sk_live_... (Change from Stripe Dashboard)
STRIPE_PUBLISHABLE_KEY = pk_live_... (Change from Stripe Dashboard)
```

---

## 📋 Checklist السريعة

### Frontend:
- [ ] ❌ DELETE `JWT_SECRET`

### Backend:
- [ ] 🔄 UPDATE `AUTH_SECRET` → `2Xx6uvc8Js8BS2FCu8a9UF9axMgzfX4WcjwFG/87jS8=`
- [ ] 🔄 UPDATE `NEXTAUTH_SECRET` → `2Xx6uvc8Js8BS2FCu8a9UF9axMgzfX4WcjwFG/87jS8=`
- [ ] ⚠️ Stripe: Test أم Live? (قرارك)

---

**⏱️ الوقت المطلوب:** 5 دقائق  
**بعد التصحيحات:** ✅ النظام جاهز 100%!





