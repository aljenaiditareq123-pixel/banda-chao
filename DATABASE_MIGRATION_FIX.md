# 🔧 Database Migration Fix - Missing `makers` Table

## 📋 Issue

The backend is returning 500 errors because the `makers` table doesn't exist in the production database:

```
Invalid `prisma.maker.count()` invocation:
The table `public.makers` does not exist in the current database.
```

## 🔍 Root Cause

The `render.yaml` file includes `prisma migrate deploy` in the build command, but **Render is not using it**. Render is using an old build command from the Dashboard settings that doesn't include migrations.

### Current Render Build Command (from logs):
```
npm install --include=dev && npx prisma generate --schema=./prisma/schema.prisma && npm run build
```

### Required Build Command (from render.yaml):
```
npm install --include=dev && npx prisma generate --schema=./prisma/schema.prisma && npx prisma migrate deploy --schema=./prisma/schema.prisma && npm run build
```

**Missing**: `npx prisma migrate deploy --schema=./prisma/schema.prisma`

## ✅ Solution

### Option 1: Update Build Command in Render Dashboard (RECOMMENDED)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select Backend Service**: `banda-chao-backend`
3. **Go to Settings** → **Build & Deploy**
4. **Update Build Command** to:
   ```bash
   npm install --include=dev && npx prisma generate --schema=./prisma/schema.prisma && npx prisma migrate deploy --schema=./prisma/schema.prisma && npm run build
   ```
5. **Save** and **Manually Deploy** the service

### Option 2: Use Render Shell (IMMEDIATE FIX)

Run migrations manually via Render Shell:

1. **Go to Render Dashboard** → Backend Service → **Shell**
2. **Run**:
   ```bash
   cd /opt/render/project/src/server
   npx prisma migrate deploy --schema=./prisma/schema.prisma
   ```

This will immediately create the missing `makers` table.

### Option 3: Enable Blueprint (FUTURE)

If using `render.yaml` as a Blueprint:

1. **Go to Render Dashboard** → **New** → **Blueprint**
2. **Connect your GitHub repository**
3. **Render will automatically use `render.yaml`**

This ensures `render.yaml` is always used for deployments.

## 📝 Migration Files Available

The following migrations should be applied:

1. `20251115061250_init` - Initial schema (users, products, videos, etc.)
2. `20251115064930_add_user_role` - Adds `role` column to users
3. `20251115081910_add_orders_system` - Adds orders and order_items tables
4. `20251115082821_add_post_likes_and_follow_system` - Adds post_likes and follows tables
5. `20251117054139_add_notifications_system` - Adds notifications table
6. `20251117061419_add_maker_user_relation` - **Creates `makers` table** (this is missing!)

## 🔍 Verification

After running migrations, verify by checking logs:

```
✅ Applying migration `20251117061419_add_maker_user_relation`
✅ Migration applied successfully
```

Or test the endpoint:
```bash
curl https://banda-chao-backend.onrender.com/api/v1/makers?limit=1
```

Should return:
```json
{
  "data": [],
  "total": 0,
  "pagination": {
    "limit": 1,
    "total": 0
  }
}
```

Instead of a 500 error.

## ⚠️ Important Notes

1. **Backup First**: If the database has existing data, consider backing it up before running migrations
2. **No Data Loss**: The migrations are designed to be safe, but always verify in staging first
3. **Prisma Migrate Deploy**: This command is **safe for production** - it only applies pending migrations and won't modify existing data

## 🚀 Quick Fix Commands

### Via Render Shell:
```bash
cd /opt/render/project/src/server
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

### Via Render Dashboard:
1. Backend Service → Settings → Build & Deploy
2. Update Build Command to include `npx prisma migrate deploy --schema=./prisma/schema.prisma`
3. Save → Manual Deploy

## ✅ Status

- ✅ Migration files exist and are correct
- ✅ `render.yaml` has correct build command
- ⚠️ **Action Required**: Update Render Dashboard build command OR run migrations via Shell
- ⚠️ **After Fix**: Backend endpoints should work correctly

