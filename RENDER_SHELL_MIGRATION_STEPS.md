# 🔧 Render Shell Migration - Step-by-Step Guide

## 📋 Problem

Backend returns 500 errors because the `makers` table doesn't exist:
```
Invalid `prisma.maker.count()` invocation:
The table `public.makers` does not exist in the current database.
```

## ✅ Quick Fix (5 minutes)

### Step 1: Open Render Shell

1. **Open Browser**: Go to https://dashboard.render.com
2. **Login** to your account
3. **Select Service**: `banda-chao-backend` (or `banda-chao`)
4. **Left Sidebar**:
   - Find section **"MANAGE"**
   - Click **"Shell"** (Terminal icon)
5. **Main Area**:
   - You'll see a large dark box (Web Shell)
   - A blinking cursor indicates it's ready

---

### Step 2: Run Migration Command

**Copy and paste this exact command** into the shell:

```bash
cd /opt/render/project/src/server && npx prisma migrate deploy --schema=./prisma/schema.prisma
```

**Press Enter**

---

### Step 3: Wait for Completion

You'll see messages like:
```
✅ Applying migration `20251115061250_init`
✅ Applying migration `20251115064930_add_user_role`
✅ Applying migration `20251115081910_add_orders_system`
✅ Applying migration `20251115082821_add_post_likes_and_follow_system`
✅ Applying migration `20251117054139_add_notifications_system`
✅ Applying migration `20251117061419_add_maker_user_relation`
✅ Migration applied successfully
```

**Wait until you see "Migration applied successfully" or "No pending migrations"**

---

### Step 4: Verify the Fix

**Copy and paste this command**:

```bash
curl https://banda-chao-backend.onrender.com/api/v1/makers?limit=1
```

**Press Enter**

**You should see**:
```json
{"data":[],"total":0,"pagination":{"limit":1,"total":0}}
```

**If you see this** = ✅ Fix successful!

**If you see a 500 error** = ⚠️ Issue persists (check logs)

---

## 🔄 Permanent Fix (For Future)

### Update Build Command in Render Dashboard

1. **In Render Dashboard**:
   - Backend Service → **Settings**
   - Click **"Build & Deploy"** tab
   - Find **"Build Command"** field

2. **Ensure Build Command contains**:
   ```bash
   npm install --include=dev && npx prisma generate --schema=./prisma/schema.prisma && npx prisma migrate deploy --schema=./prisma/schema.prisma && npm run build
   ```

3. **If different**:
   - **Delete** old Build Command
   - **Copy and paste** the command above
   - **Save**
   - Click **"Manual Deploy"** → **"Deploy latest commit"**

4. **After deployment**:
   - ✅ Migrations will run automatically on every new deployment
   - ✅ No need to run manually again

---

## ❓ Common Questions

### Q: What if I see "command not found"?
**A**: Make sure you're in the correct directory:
```bash
cd /opt/render/project/src/server
```
Then try again.

### Q: What if I see "schema.prisma not found"?
**A**: Verify the path:
```bash
cd /opt/render/project/src/server
ls -la prisma/schema.prisma
```
You should see the file exists.

### Q: What if I see "No pending migrations"?
**A**: ✅ That's good! It means all migrations are already applied. The issue might be elsewhere.

### Q: How long does it take?
**A**: Usually 5-30 seconds.

### Q: Will I lose existing data?
**A**: ❌ No. `prisma migrate deploy` is safe and doesn't delete existing data. It only adds missing tables.

---

## 🎯 Summary

1. **Open Render Shell** (Left sidebar → Shell)
2. **Run command**:
   ```bash
   cd /opt/render/project/src/server && npx prisma migrate deploy --schema=./prisma/schema.prisma
   ```
3. **Wait** for completion
4. **Verify**:
   ```bash
   curl https://banda-chao-backend.onrender.com/api/v1/makers?limit=1
   ```
5. **Done!** ✅

---

**If you encounter any issues, take a screenshot of the error message.**

