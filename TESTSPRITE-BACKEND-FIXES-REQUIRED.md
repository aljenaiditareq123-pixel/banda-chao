# TestSprite Backend Test Failures - Root Cause & Fix

## Executive Summary

**Status:** 🔴 **CRITICAL - Backend deployment requires database migrations**

- **13/15 backend tests failed (2 passed)**
- **12/13 failures are 404 errors** on `GET /api/v1/users` endpoint
- **Root Cause:** Production database on Render is missing the `role` column
- **Impact:** Login fails → No valid tokens → All authenticated endpoints return 404/403

---

## 🔍 Root Cause Analysis

### Issue #1: Database Schema Out of Sync

**Error from Production:**
```json
{
  "error": "Failed to login",
  "message": "The column `users.role` does not exist in the current database."
}
```

**Problem:**
- Prisma schema defines `role UserRole @default(USER)` on User model
- Migration exists: `server/prisma/migrations/20251115064930_add_user_role/migration.sql`
- **Migration has NOT been run on Render's production database**

**Impact:**
- ✅ Code is deployed (endpoint exists)
- ❌ Database schema is outdated
- ❌ Login fails → No tokens can be generated
- ❌ TestSprite can't authenticate → All tests fail with 404/403

### Issue #2: Endpoint Deployment Status

**Current Status:**
- ✅ `GET /api/v1/users` endpoint code exists and is deployed
- ✅ Route is registered: `app.use('/api/v1/users', userRoutes);`
- ✅ Endpoint responds (without auth: `{"error":"Access token required"}`)
- ❌ **Cannot test with valid token because login fails**

---

## 🛠️ Required Fixes

### Fix #1: Run Database Migrations on Render (CRITICAL)

**Step 1: Access Render Shell**

1. Go to: https://dashboard.render.com
2. Select your **backend service** (e.g., "banda-chao-backend")
3. Click **"Shell"** tab
4. Or use Render CLI if configured

**Step 2: Run Prisma Migrate**

```bash
# Navigate to server directory
cd server

# Run migrations
npx prisma migrate deploy

# Or if migrate deploy doesn't work:
npx prisma migrate reset --force  # WARNING: This resets the database
npx prisma migrate dev
```

**Step 3: Generate Prisma Client**

```bash
npx prisma generate
```

**Step 4: Verify Migration**

```bash
# Check if role column exists
npx prisma db execute --stdin <<< "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role';"
```

**Expected Output:** Should show `role` column exists

---

### Fix #2: Update Render Build Command (Prevent Future Issues) ✅ DONE

**Current Build Command (in `render.yaml`):**
```yaml
buildCommand: npm install --include=dev && npx prisma generate --schema=./prisma/schema.prisma && npm run build
```

**✅ UPDATED Build Command:**
```yaml
buildCommand: npm install --include=dev && npx prisma generate --schema=./prisma/schema.prisma && npx prisma migrate deploy --schema=./prisma/schema.prisma && npm run build
```

**Status:** ✅ Updated in both `render.yaml` and `server/render.yaml`

**Next Steps:**
1. Commit and push the updated `render.yaml` files
2. Next deployment will automatically run migrations
3. **For NOW:** Still need to manually run migration (Fix #1) to fix current production database

---

### Fix #3: Verify Endpoint After Migration

**Test Script:**

```bash
# 1. Test login (should work after migration)
TOKEN=$(curl -s -X POST https://banda-chao-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@bandachao.com","password":"password123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Token: $TOKEN"

# 2. Test GET /users with valid token
curl -X GET https://banda-chao-backend.onrender.com/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Expected: 200 OK with user list JSON
```

---

## 📋 TestSprite Test Analysis

### Why Tests Failed:

| Test | Expected | Got | Reason |
|------|-----------|-----|--------|
| Valid User Creation | 201 | 404 | Can't get token → using invalid token → 404 |
| User Creation Missing Fields | 400 | 404 | Same as above |
| Valid User Update | 200 | 404 | No valid token |
| Unauthorized User Update | 401 | 404 | Endpoint responds with 403, but test expects 401 |
| Delete User with Dependencies | 409 | 404 | No valid token |
| Unauthorized User Deletion | 401 | 404 | Endpoint responds correctly, but test token is invalid |
| Successful User Deletion | 204 | 404 | No valid token |

**Key Observation:**
- Tests are using placeholder tokens: `"your_valid_token_here"`, `"YOUR_INVALID_OR_MISSING_TOKEN"`
- TestSprite needs to **authenticate first** to get a real token
- Login endpoint fails due to database schema issue
- **Solution:** Fix database → Login works → Tests can authenticate → Tests pass

---

## ✅ Verification Checklist

After applying fixes:

- [ ] Database migrations run successfully on Render
- [ ] `users.role` column exists in production database
- [ ] Login endpoint returns valid JWT token
- [ ] `GET /api/v1/users` returns 200 OK with valid token
- [ ] `GET /api/v1/users` returns 401/403 without token (not 404)
- [ ] TestSprite can authenticate and get tokens
- [ ] Re-run TestSprite backend tests → Should pass most tests

---

## 🚀 Quick Fix Steps (Summary)

1. **SSH into Render backend service**
2. **Run:** `cd server && npx prisma migrate deploy`
3. **Run:** `npx prisma generate`
4. **Restart backend service** (if needed)
5. **Test login:** `curl -X POST .../auth/login -d '{"email":"user1@bandachao.com","password":"password123"}'`
6. **Test GET /users:** Use token from step 5
7. **Update Render build command** to include migrations
8. **Re-run TestSprite tests**

---

## 📝 Additional Notes

### Migration File Reference

**File:** `server/prisma/migrations/20251115064930_add_user_role/migration.sql`

```sql
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'FOUNDER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';
```

This migration:
- Creates the `UserRole` enum type
- Adds `role` column to `users` table with default `'USER'`

### Why 404 Instead of 401/403?

Some tests expect 401 Unauthorized but get 404 Not Found. This could be:
- Route not matching (but we confirmed it exists)
- Authentication middleware returning 404 before 401 check
- OR: TestSprite using completely invalid/expired tokens that hit a different error path

After fixing the database, we should see:
- Valid token → 200 OK
- Invalid token → 401/403 (not 404)
- No token → 401/403 (not 404)

---

## 🔗 Related Files

- **Schema:** `server/prisma/schema.prisma` (line 25: `role UserRole @default(USER)`)
- **Migration:** `server/prisma/migrations/20251115064930_add_user_role/migration.sql`
- **Endpoint:** `server/src/api/users.ts` (line 47: `router.get('/', authenticateToken, ...)`)
- **Routes:** `server/src/index.ts` (line 89: `app.use('/api/v1/users', userRoutes);`)

---

**Priority:** 🔴 **CRITICAL** - Blocks all backend testing  
**Estimated Fix Time:** 5-10 minutes (database migration)  
**Next Steps:** Run migrations on Render → Verify login → Re-run TestSprite

