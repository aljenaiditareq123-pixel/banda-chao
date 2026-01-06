# 🔧 إصلاح خطأ 404 - Environment Variable خاطئ

**تاريخ:** 2025-01-04  
**المشكلة:** "Request failed with status code 404" عند تسجيل الدخول

---

## 🔍 تحليل المشكلة

### المشكلة:
- `NEXT_PUBLIC_API_URL` في Render يشير إلى **Frontend** service
- القيمة الحالية: `https://banda-chao.onrender.com` ❌
- يجب أن يشير إلى **Backend** service
- القيمة الصحيحة: `https://banda-chao-backend.onrender.com` ✅

### النتيجة:
- الطلب يذهب إلى: `https://banda-chao.onrender.com/api/v1/auth/login` ❌ (غير موجود)
- يجب أن يذهب إلى: `https://banda-chao-backend.onrender.com/api/v1/auth/login` ✅

---

## ✅ الحل

### في Render Dashboard:

1. **اذهب إلى:** Render Dashboard → Frontend service (`banda-chao-frontend`)
2. **افتح:** Environment tab
3. **ابحث عن:** `NEXT_PUBLIC_API_URL`
4. **غيّر القيمة من:**
   ```
   https://banda-chao.onrender.com
   ```
   **إلى:**
   ```
   https://banda-chao-backend.onrender.com
   ```
5. **احفظ** التغييرات
6. **Render سيعيد التشغيل تلقائياً**

---

## 📋 Checklist

- [ ] اذهب إلى Render Dashboard
- [ ] Frontend service → Environment
- [ ] ابحث عن `NEXT_PUBLIC_API_URL`
- [ ] غيّر من `https://banda-chao.onrender.com` إلى `https://banda-chao-backend.onrender.com`
- [ ] احفظ
- [ ] انتظر إعادة التشغيل (1-2 دقيقة)
- [ ] جرب تسجيل الدخول مرة أخرى

---

## 🎯 النتيجة المتوقعة

بعد التعديل:
- ✅ الطلب سيذهب إلى: `https://banda-chao-backend.onrender.com/api/v1/auth/login`
- ✅ Backend service موجود ويعمل
- ✅ تسجيل الدخول يجب أن يعمل الآن

---

**📅 آخر تحديث:** 2025-01-04







