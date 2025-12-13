# نظام المرآة (Mirror System) - التطبيق الكامل

## نظرة عامة

تم تطبيق "نظام المرآة" لتقليل تكاليف الاستضافة وزيادة الانتشار عبر ربط المحتوى (Videos, Posts) بالمنصات الخارجية (TikTok, YouTube, Instagram).

## التغييرات المطبقة

### 1. تحديث قاعدة البيانات (Prisma Schema)

#### جدول `social_accounts` (جديد)
```prisma
model social_accounts {
  id                String   @id @default(uuid())
  user_id           String
  platform          String   // TIKTOK, YOUTUBE, INSTAGRAM, FACEBOOK, TWITTER
  platform_user_id  String?
  access_token      String   // Encrypted access token
  refresh_token     String?
  token_expires_at  DateTime?
  is_active         Boolean  @default(true)
  metadata          String?  // JSON stored as string
  // ...
}
```

**الوظيفة**: تخزين Access Tokens للمنصات الخارجية لكل مستخدم.

#### تحديث `videos` و `posts`
```prisma
// في model videos و model posts:
external_id    String? // ID على المنصة الخارجية
platform       String? // TIKTOK, YOUTUBE, INSTAGRAM, etc.
```

**الوظيفة**: تتبع المحتوى المزامن مع المنصات الخارجية.

#### تحديث `coordinator_logs`
```prisma
// إضافة حقول جديدة:
content_type  String? // VIDEO, POST
content_id    String? // ID of video or post
platform      String? // TIKTOK, YOUTUBE, etc.
```

**الوظيفة**: تتبع عمليات المزامنة والنتائج.

### 2. Coordinator Service

**الملف**: `server/src/services/coordinatorService.ts`

#### الوظائف الرئيسية:

1. **`syncContentToPlatforms(request)`**
   - مزامنة المحتوى (Video/Post) مع المنصات الخارجية
   - تحديث `external_id` و `platform` في قاعدة البيانات
   - تسجيل العملية في `coordinator_logs`

2. **`getSyncStatus(contentId, contentType)`**
   - الحصول على حالة المزامنة للمحتوى

3. **`getUserSocialAccounts(userId)`**
   - الحصول على حسابات المنصات النشطة للمستخدم

4. **`upsertSocialAccount(...)`**
   - إضافة/تحديث حساب منصة اجتماعية

#### TODO (للتطوير المستقبلي):
- [ ] ربط TikTok API
- [ ] ربط YouTube Data API v3
- [ ] ربط Instagram Graph API
- [ ] تشفير/فك تشفير Access Tokens
- [ ] تجديد Access Tokens تلقائياً

### 3. API Routes

**الملف**: `server/src/api/coordinator.ts`

#### Endpoints:

1. **POST `/api/v1/coordinator/sync-content`**
   ```json
   {
     "contentId": "video-id-123",
     "contentType": "VIDEO",
     "platforms": ["TIKTOK", "YOUTUBE"]
   }
   ```

2. **GET `/api/v1/coordinator/sync-status/:contentId?contentType=VIDEO`**
   - الحصول على حالة المزامنة

3. **GET `/api/v1/coordinator/social-accounts`**
   - الحصول على حسابات المنصات للمستخدم

4. **POST `/api/v1/coordinator/social-accounts`**
   ```json
   {
     "platform": "TIKTOK",
     "accessToken": "token-here",
     "refreshToken": "refresh-token",
     "platformUserId": "user-id-on-platform"
   }
   ```

5. **DELETE `/api/v1/coordinator/social-accounts/:accountId`**
   - إلغاء تفعيل حساب منصة

## الخطوات التالية

### 1. Migration قاعدة البيانات
```bash
npx prisma generate
npx prisma db push
```

### 2. ربط APIs المنصات

#### TikTok:
- [ ] إنشاء TikTok Developer App
- [ ] الحصول على Client Key & Secret
- [ ] تطبيق OAuth 2.0 Flow
- [ ] ربط TikTok Video Upload API

#### YouTube:
- [ ] إنشاء Google Cloud Project
- [ ] تفعيل YouTube Data API v3
- [ ] تطبيق OAuth 2.0 Flow
- [ ] ربط YouTube Video Upload API

#### Instagram:
- [ ] إنشاء Facebook App
- [ ] تفعيل Instagram Graph API
- [ ] تطبيق OAuth 2.0 Flow
- [ ] ربط Instagram Media Upload API

### 3. الأمان
- [ ] تشفير Access Tokens قبل الحفظ
- [ ] تجديد Tokens تلقائياً عند انتهاء الصلاحية
- [ ] Rate Limiting لـ API Calls

### 4. Frontend Integration
- [ ] واجهة ربط حسابات المنصات
- [ ] زر "نشر على TikTok/YouTube"
- [ ] عرض حالة المزامنة
- [ ] Embedded Player (بدلاً من ملف مباشر)

## ملاحظات مهمة

1. **Embedded Player**: في المستقبل، سيتم استخدام Embedded Player من المنصات بدلاً من استضافة الفيديو مباشرة.

2. **التكلفة**: نظام المرآة يقلل تكاليف الاستضافة بشكل كبير عبر الاعتماد على استضافة المنصات الخارجية.

3. **الانتشار**: المحتوى المزامن يصل لجمهور أوسع عبر المنصات المختلفة.

## الملفات المعدلة

- ✅ `prisma/schema.prisma` - تحديث Schema
- ✅ `server/src/services/coordinatorService.ts` - خدمة المنسق
- ✅ `server/src/api/coordinator.ts` - API Routes
- ✅ `server/src/index.ts` - تسجيل Routes

## الحالة الحالية

✅ **Schema**: جاهز وصحيح  
✅ **Service**: هيكل كامل مع TODOs للمنصات  
✅ **API Routes**: جاهزة للاستخدام  
⏳ **Migration**: يحتاج `npx prisma db push`  
⏳ **API Integration**: يحتاج ربط APIs المنصات الفعلية
