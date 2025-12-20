# 🔐 معلومات حساب المؤسس - Founder Account Information

**البريد الإلكتروني:** `aljenaiditareq123@gmail.com`  
**الدور:** `FOUNDER`

---

## 🔑 كلمات المرور المحتملة

بناءً على فحص ملفات Seed والـ Scripts، هناك عدة احتمالات:

### الاحتمال الأكثر احتمالاً (من ملفات render scripts):

**كلمة المرور:** `T123q123`

**المصادر:**
- `server/scripts/render-reset-database.sh` - يذكر: `aljenaiditareq123@gmail.com / T123q123`
- `server/scripts/render-full-setup.sh` - يحدد: `PASSWORD="T123q123"`
- `server/scripts/render-create-user.sh` - يحدد: `PASSWORD="T123q123"`

---

### الاحتمالات الأخرى:

#### 1. Environment Variable:
إذا تم تعيين `FOUNDER_DEFAULT_PASSWORD` في Render Environment Variables، فستكون هي الكلمة المستخدمة.

**للتحقق:**
- اذهب إلى Render Dashboard → Backend Service → Environment
- ابحث عن `FOUNDER_DEFAULT_PASSWORD`
- إذا كانت موجودة، هذه هي كلمة المرور

#### 2. Random Password (إذا لم يتم تعيين Environment Variable):
إذا لم يتم تعيين `FOUNDER_DEFAULT_PASSWORD`، فبعض الـ Scripts تولد كلمة مرور عشوائية:
```
Temp[random_string]!
```

**المشكلة:** هذه الكلمة عشوائية ولا يمكن توقعها.

---

## ✅ الحل الموصى به

### الخيار 1: استخدام كلمة المرور `T123q123`

**جرب أولاً:**
- Email: `aljenaiditareq123@gmail.com`
- Password: `T123q123`

### الخيار 2: إعادة تعيين كلمة المرور

إذا لم تعمل `T123q123`، يمكنك إعادة تعيين كلمة المرور من Render Shell:

```bash
# في Render Shell
cd /opt/render/project/src/server
npx ts-node -e "
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
const newPassword = 'YourNewPassword123!';
const hashed = await bcrypt.hash(newPassword, 10);
await prisma.\$executeRaw\`
  UPDATE users SET password = \${hashed} WHERE email = 'aljenaiditareq123@gmail.com';
\`;
console.log('Password updated! New password:', newPassword);
await prisma.\$disconnect();
"
```

### الخيار 3: التحقق من Environment Variable

**في Render Dashboard:**
1. Backend Service → Environment
2. ابحث عن `FOUNDER_DEFAULT_PASSWORD`
3. إذا كانت موجودة، استخدمها

---

## 📝 ملاحظات

1. **أمان:** بعد تسجيل الدخول الناجح، يُنصح بتغيير كلمة المرور
2. **التشفير:** جميع كلمات المرور مخزنة بشكل مشفر (bcrypt) في قاعدة البيانات
3. **Multiple Sources:** قد تكون كلمة المرور مختلفة اعتماداً على أي script تم استخدامه لإنشاء الحساب

---

**تاريخ:** 2025-01-20  
**الحالة:** ⚠️ يرجى المحاولة بـ `T123q123` أولاً
