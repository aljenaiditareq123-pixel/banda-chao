# ✅ إصلاح خطأ TypeScript Property 'file' does not exist on type 'AuthRequest'

## 🔍 المشكلة

Build فشل على Render مع أخطاء TypeScript:
```
error TS2339: Property 'file' does not exist on type 'AuthRequest'.
```

هذا الخطأ يحدث في عدة ملفات:
- `src/api/posts.ts`
- `src/api/products.ts`
- `src/api/speech.ts`
- `src/api/users.ts`
- `src/api/videos.ts`

## ✅ الحل المطبق

### المشكلة الأساسية
`AuthRequest` interface لا يحتوي على خاصية `file` التي يضيفها multer middleware عند رفع الملفات.

### الحل
إضافة خاصية `file` و `files` من multer إلى `AuthRequest` interface:

```typescript
export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  file?: Express.Multer.File;
  files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
}
```

## ✅ ما تم التحقق منه

1. ✅ Build يعمل محلياً بنجاح
2. ✅ TypeScript compiler يعرف خاصية `file` و `files`
3. ✅ جميع الأخطاء المتعلقة بـ `Property 'file' does not exist` تم حلها

## 📝 ملاحظات

- `Express.Multer.File` هو type من `@types/multer`
- `file` للرفع الفردي (single file upload)
- `files` للرفع المتعدد (multiple files upload)
- كلا الخاصيتين optional (`?`) لأنها موجودة فقط بعد multer middleware

---

**تاريخ الإصلاح:** 2025-01-20  
**الحالة:** ✅ تم الإصلاح  
**Commit:** بعد الرفع
