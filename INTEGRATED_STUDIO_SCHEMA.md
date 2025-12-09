# ✅ Integrated Studio Model - Database Schema Update

## Overview

Updated Prisma schema to support the "Integrated Studio" model where:
- **Zero Storage**: We stream uploads to external APIs (TikTok, YouTube), don't keep raw files
- **Seamless Integration**: Store OAuth tokens to manage external accounts
- **Makers Never Leave**: Post content directly to external platforms from our UI

---

## ✅ Changes Implemented

### 1. **Service Model** (Intangible Products)

```prisma
model services {
  id          String      @id
  title       String
  description String
  price       Float
  type        ServiceType // DRIVER, AGENT, ARTISAN
  maker_id    String
  created_at  DateTime    @default(now())
  updated_at  DateTime
  makers      makers      @relation(fields: [maker_id], references: [id], onDelete: Cascade)

  @@index([maker_id])
  @@index([type])
  @@index([created_at])
}
```

**Purpose**: Store intangible services (delivery, agent services, artisan services) that makers offer.

**ServiceType Enum**:
- `DRIVER` - Delivery/transport service
- `AGENT` - Sales/representation service
- `ARTISAN` - Craft/creative service

---

### 2. **SocialConnection Model** (OAuth Tokens - The Keys)

```prisma
model social_connections {
  id           String            @id
  platform     SocialPlatform    // TIKTOK, YOUTUBE, INSTAGRAM
  access_token String            // OAuth access token (encrypted in production)
  refresh_token String?          // OAuth refresh token (encrypted in production)
  expires_at   DateTime?         // Token expiration
  scope        String?           // OAuth scopes granted
  maker_id     String
  created_at   DateTime          @default(now())
  updated_at   DateTime
  makers       makers            @relation(fields: [maker_id], references: [id], onDelete: Cascade)

  @@unique([maker_id, platform]) // One connection per platform per maker
  @@index([maker_id])
  @@index([platform])
}
```

**Purpose**: Store OAuth tokens to allow posting on behalf of makers without them leaving the dashboard.

**SocialPlatform Enum**:
- `TIKTOK`
- `YOUTUBE`
- `INSTAGRAM`

**Key Features**:
- Unique constraint: One connection per platform per maker
- Stores access_token and refresh_token for API calls
- Tracks expiration and OAuth scopes

---

### 3. **Post Model** (Updated - Text Updates)

```prisma
model posts {
  id         String       @id
  content    String       // Text updates/content
  user_id    String
  maker_id   String?      // Optional link to maker
  images     String[]     @default([]) // Optional images (can be empty for text-only posts)
  created_at DateTime     @default(now())
  updated_at DateTime
  post_likes post_likes[]
  users      users        @relation(fields: [user_id], references: [id], onDelete: Cascade)
  makers     makers?      @relation(fields: [maker_id], references: [id], onDelete: SetNull)

  @@index([user_id])
  @@index([maker_id])
  @@index([created_at])
}
```

**Changes**:
- Added `maker_id` (optional) to link posts to makers
- Images array defaults to empty (supports text-only posts)
- Added index on `maker_id` and `created_at`

---

### 4. **Video Model** (Updated - External URLs Only)

```prisma
model videos {
  id            String        @id
  user_id       String
  maker_id      String?       // Link to maker (optional for backward compatibility)
  title         String
  description   String?
  url           String        // External URL from TikTok/YouTube API (replaces video_url)
  thumbnail_url String?
  duration      Int?
  platform      VideoPlatform // TIKTOK or YOUTUBE
  type          VideoType    // SHORT (Reels), LONG (Doc), DEMO
  views         Int           @default(0)
  likes         Int           @default(0)
  created_at    DateTime      @default(now())
  updated_at    DateTime
  comments      comments[]
  video_likes   video_likes[]
  users         users         @relation(fields: [user_id], references: [id], onDelete: Cascade)
  makers        makers?       @relation(fields: [maker_id], references: [id], onDelete: SetNull)

  @@index([created_at])
  @@index([type])
  @@index([platform])
  @@index([user_id])
  @@index([maker_id])
}
```

**Key Changes**:
- ✅ **Removed local storage fields**: No `video_url` (local file path)
- ✅ **Added `url`**: External URL received back from TikTok/YouTube API
- ✅ **Added `platform`**: `VideoPlatform` enum (TIKTOK, YOUTUBE)
- ✅ **Updated `type`**: `VideoType` enum (SHORT, LONG, DEMO)
- ✅ **Added `maker_id`**: Link videos to makers
- ✅ **Made `thumbnail_url` and `duration` optional**: May not always be available from external APIs

**VideoPlatform Enum**:
- `TIKTOK`
- `YOUTUBE`

**VideoType Enum**:
- `SHORT` - Short-form content (Reels, TikTok videos)
- `LONG` - Long-form content (Documentaries, full videos)
- `DEMO` - Product demonstrations

---

### 5. **SocialLink Model** (New - Profile Display Links)

```prisma
model social_links {
  id        String   @id
  platform  String   // Platform name (e.g., "TikTok", "YouTube", "Instagram")
  url       String   // Profile URL
  maker_id  String
  created_at DateTime @default(now())
  updated_at DateTime
  makers    makers   @relation(fields: [maker_id], references: [id], onDelete: Cascade)

  @@index([maker_id])
}
```

**Purpose**: Simple profile display links (not OAuth). Used for showing maker's social media profiles on their page.

**Difference from SocialConnection**:
- `SocialLink`: Simple URL display (no OAuth, no posting capability)
- `SocialConnection`: OAuth tokens (allows posting on behalf of maker)

---

### 6. **Makers Model** (Updated)

**Added Relations**:
- `services` - Maker's intangible services
- `social_connections` - OAuth connections for posting
- `social_links` - Profile display links
- `videos` - Videos linked to maker
- `posts` - Posts linked to maker

**Added Field**:
- `country` - Country for shipping origin (used in shipping calculations)

---

## 📊 Schema Summary

### New Models:
1. ✅ `services` - Intangible products
2. ✅ `social_connections` - OAuth tokens
3. ✅ `social_links` - Profile display links

### Updated Models:
1. ✅ `videos` - External URLs only, no local storage
2. ✅ `posts` - Added maker_id, supports text-only posts
3. ✅ `makers` - Added relations and country field

### New Enums:
1. ✅ `ServiceType` - DRIVER, AGENT, ARTISAN
2. ✅ `SocialPlatform` - TIKTOK, YOUTUBE, INSTAGRAM
3. ✅ `VideoPlatform` - TIKTOK, YOUTUBE
4. ✅ `VideoType` - SHORT, LONG, DEMO

---

## 🔐 Security Considerations

**OAuth Tokens**:
- `access_token` and `refresh_token` should be **encrypted** in production
- Consider using environment variables or a secrets manager
- Implement token refresh logic before expiration
- Store minimal scopes needed for posting

**Recommendations**:
1. Encrypt tokens at rest (database encryption)
2. Use HTTPS for all API calls
3. Implement token rotation/refresh
4. Log access to social connections for audit

---

## 🚀 Next Steps

### 1. ✅ Schema Updated
- All models added/updated
- Enums created
- Relations established

### 2. ✅ Prisma Generate
- Client generated successfully
- Ready for use in code

### 3. ⏳ Migration (NOT RUN YET - Per User Request)
- Migration file will be created when ready
- Review migration SQL before applying
- Test in development first

### 4. ⏳ Implementation Tasks
- Create OAuth flow for TikTok/YouTube
- Implement video upload streaming to external APIs
- Build UI for managing social connections
- Add service management UI
- Update video creation flow to use external URLs

---

## 📝 Migration Notes

**When ready to migrate**:
```bash
cd server
npx prisma migrate dev --name integrated_studio_model
```

**Backward Compatibility**:
- `videos.maker_id` is optional (backward compatible)
- `videos.url` replaces `video_url` (migration will rename)
- `posts.maker_id` is optional (backward compatible)
- Existing data will need migration script for:
  - Renaming `video_url` → `url` in videos
  - Setting `platform` based on existing data
  - Setting `type` based on existing data

---

## ✅ Status

**Schema Update**: ✅ **COMPLETE**
**Prisma Generate**: ✅ **COMPLETE**
**Migration**: ⏳ **NOT RUN** (Per user request)

**Ready for**: Code implementation and testing
