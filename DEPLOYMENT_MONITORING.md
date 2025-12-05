# 🚀 Deployment Monitoring Guide

**Status:** Deployment Triggered  
**Date:** $(date)  
**Commits:** dc65da4, e44de4d

---

## ✅ Actions Completed

1. ✅ **Triggered Deployment**
   - Created trigger commit: `e44de4d`
   - Fixed dangerous `--force-reset` flag: `dc65da4`
   - Pushed to `main` branch

2. ✅ **Build Fixes Applied**
   - Removed `--force-reset` from postbuild script (prevents database wipe)
   - Postbuild now safely uses: `prisma migrate deploy` → `prisma db push` → continue on failure

---

## 📊 Monitor Deployment

### Step 1: Open Render Dashboard
🔗 **https://dashboard.render.com/**

### Step 2: Check Service Status

#### Backend Service (banda-chao-backend)
1. Navigate to your Backend service
2. Check **Status** indicator:
   - 🟡 **Building** = In progress
   - 🟢 **Live** = Success!
   - 🔴 **Deploy Failed** = Needs investigation

#### Frontend Service (banda-chao-frontend)
1. Navigate to your Frontend service
2. Check **Status** indicator (same as above)

### Step 3: Review Build Logs

Click on **"Logs"** tab for each service:

#### ✅ Success Indicators:
```
✅ npm install completed
✅ npm run build completed
✅ Prisma generate completed
✅ Prisma migrate deploy completed (or db push)
✅ Server is running on port...
```

#### ❌ Error Indicators to Watch For:
- `Error: Cannot find module...`
- `Prisma schema validation error`
- `Database connection failed`
- `Build failed with exit code...`

---

## 🔧 Common Build Issues & Fixes

### Issue 1: Prisma Migration Fails
**Error:** `P2022` or `Migration failed`

**Fix:** This is handled by the postbuild script fallback:
- First tries `prisma migrate deploy`
- Falls back to `prisma db push --accept-data-loss`
- Continues even if both fail

**Action:** Check logs to see which method succeeded.

### Issue 2: Database Connection Error
**Error:** `Can't reach database server` or `Connection refused`

**Fix:** 
1. Verify `DATABASE_URL` in Environment Variables
2. Check database is running (should be "Live" after upgrade)
3. Ensure database URL uses correct host (internal vs external)

**Action:** Update `DATABASE_URL` if needed, then redeploy.

### Issue 3: Build Timeout
**Error:** `Build timeout exceeded`

**Fix:**
- Render free tier has 10-minute build limit
- Paid plans have longer limits
- If timeout occurs, try manual deploy again

**Action:** Wait 5 minutes, then trigger "Manual Deploy" again.

### Issue 4: Missing Environment Variables
**Error:** `Environment variable not found: XXX`

**Fix:**
1. Go to Service → Environment
2. Add missing variable
3. Redeploy

**Action:** Add all required variables from `.env` files.

---

## 📋 Required Environment Variables

### Backend (banda-chao-backend):
- ✅ `DATABASE_URL` (from Render PostgreSQL)
- ✅ `JWT_SECRET`
- ✅ `JWT_EXPIRES_IN` (optional, defaults to "7d")
- ✅ `FRONTEND_URL`
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_PUBLISHABLE_KEY`
- ✅ `STRIPE_MODE` (production)
- ✅ `GEMINI_API_KEY` (optional)

### Frontend (banda-chao-frontend):
- ✅ `NEXT_PUBLIC_API_URL` (Backend URL)
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- ✅ `NODE_ENV=production`

---

## 🎯 Success Criteria

### Backend is "Live" when:
- ✅ Status shows "Live" (green)
- ✅ Logs show: `Server is running on port...`
- ✅ Health endpoint responds: `GET /api/health` returns 200

### Frontend is "Live" when:
- ✅ Status shows "Live" (green)
- ✅ Logs show: `Ready on http://localhost:3000`
- ✅ Homepage loads without errors

---

## 🔗 Live URLs (After Build Completes)

### Frontend:
```
https://banda-chao-frontend.onrender.com
```

### Backend:
```
https://banda-chao-backend.onrender.com
```

### Health Check:
```
https://banda-chao-backend.onrender.com/api/health
```

---

## ⏱️ Expected Timeline

1. **Build Start:** Immediately after push (or manual trigger)
2. **Build Duration:** 5-10 minutes (depending on dependencies)
3. **Database Sync:** Happens during postbuild (1-2 minutes)
4. **Service Start:** 30-60 seconds after build
5. **Total Time:** ~7-12 minutes

---

## 🚨 If Deployment Fails

1. **Check Logs** for specific error
2. **Fix the issue** in code (if applicable)
3. **Commit and push** the fix
4. **Trigger Manual Deploy** again
5. **Monitor** the new build

---

## ✅ Final Verification Checklist

After both services show "Live":

- [ ] Backend health check returns 200
- [ ] Frontend homepage loads
- [ ] API endpoints respond correctly
- [ ] Database queries work (check logs)
- [ ] No critical errors in logs

---

**Last Updated:** $(date)  
**Deployment Status:** ⏳ Monitoring...



