# ✅ Render Backend Deployment Fix - COMPLETE

**Date:** 2025-11-15  
**Status:** ✅ Configuration Fixed

---

## 🔍 Issues Found & Fixed

### Issue 1: Wrong Start Command in render.yaml
**Problem:** `startCommand: npm start` runs `prisma db push --accept-data-loss` which is dangerous in production  
**Fixed:** Changed to `startCommand: node dist/index.js`

### Issue 2: Dangerous Start Script in package.json
**Problem:** `"start": "npx prisma db push --accept-data-loss && node dist/index.js"` can cause data loss  
**Fixed:** Changed to `"start": "node dist/index.js"` (production-safe)  
**Note:** Kept old command as `start:dev` for local development if needed

---

## ✅ Verified Configuration

### Repository Structure
- ✅ Backend located in `/server`
- ✅ Entry file: `server/src/index.ts`
- ✅ Build output: `server/dist/index.js`
- ✅ All routes registered under `/api/v1/*` in `server/src/index.ts`

### TypeScript Configuration
- ✅ `server/tsconfig.json` has `"outDir": "./dist"` (correct)
- ✅ `server/tsconfig.json` has `"rootDir": "./src"` (correct)

### Build Scripts
- ✅ `server/package.json` build script: `"build": "tsc --noEmit false"` (correct)
- ✅ `server/package.json` start script: `"start": "node dist/index.js"` (FIXED - now production-safe)

### Frontend API Configuration
- ✅ `lib/api.ts` correctly uses `process.env.NEXT_PUBLIC_API_URL`
- ✅ Code automatically appends `/api/v1` to the base URL
- ✅ Vercel should set: `NEXT_PUBLIC_API_URL=https://banda-chao-backend.onrender.com` (no `/api/v1`)

---

## 📋 EXACT Render Dashboard Settings

### Build & Deploy Section

**Root Directory:**
```
server
```

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
node dist/index.js
```

**Node Version:**
```
20.x.x
```
(Or `18.x.x` minimum)

---

### Environment Variables Section

**Add/Verify these variables:**

| Key | Value | Required | Notes |
|-----|-------|----------|-------|
| `NODE_ENV` | `production` | ✅ Yes | Must be exactly `production` |
| `DATABASE_URL` | `postgresql://...` | ✅ Yes | Your PostgreSQL connection string |
| `JWT_SECRET` | `your-strong-secret` | ✅ Yes | Strong random string (32+ chars) |
| `JWT_EXPIRES_IN` | `7d` | ⚠️ Optional | Default is 7d if not set |
| `FRONTEND_URL` | `https://banda-chao.vercel.app` | ⚠️ Optional | For CORS (already in code) |

**Generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

---

## 📋 EXACT Vercel Dashboard Settings

### Environment Variables Section

**Key:**
```
NEXT_PUBLIC_API_URL
```

**Value:**
```
https://banda-chao-backend.onrender.com
```

**⚠️ CRITICAL:**
- NO trailing slash
- NO `/api/v1` suffix
- Code automatically adds `/api/v1` in `lib/api.ts`

---

## ✅ Final Deployment Checklist

### Step 1: Update Render Settings

1. Go to: https://dashboard.render.com
2. Select service: `banda-chao-backend`
3. Go to: **Settings** tab
4. Scroll to: **Build & Deploy** section

**Update these fields:**

- [ ] **Root Directory:** Set to `server` (exactly, no leading slash)
- [ ] **Build Command:** Set to `npm install && npx prisma generate && npm run build`
- [ ] **Start Command:** Set to `node dist/index.js` (NOT `npm start`)
- [ ] **Node Version:** Set to `20.x.x` or `18.x.x`

5. Click **Save Changes**

---

### Step 2: Verify Render Environment Variables

1. In Render Dashboard → Your Service → **Environment** tab
2. Verify/Add these variables:

- [ ] `NODE_ENV` = `production`
- [ ] `DATABASE_URL` = (your PostgreSQL connection string)
- [ ] `JWT_SECRET` = (strong random string, 32+ characters)
- [ ] `JWT_EXPIRES_IN` = `7d` (optional)
- [ ] `FRONTEND_URL` = `https://banda-chao.vercel.app` (optional)

3. Click **Save Changes** after adding/updating

---

### Step 3: Redeploy Backend

**Option A: Manual Deploy (Recommended)**
1. In Render Dashboard → Your Service
2. Go to **Manual Deploy** tab
3. Click **Deploy latest commit**
4. Wait for build to complete (5-10 minutes)
5. Check **Logs** tab for success message:
   ```
   🚀 Server is running on http://localhost:XXXX
   📡 WebSocket server is ready
   🌍 Environment: production
   ```

**Option B: Push to Git (Auto-deploy)**
1. Commit the fixed `render.yaml` and `package.json`
2. Push to your Git repository
3. Render will auto-deploy

---

### Step 4: Test Backend Endpoints

**After deployment, test these URLs:**

**1. Health Check:**
```bash
curl https://banda-chao-backend.onrender.com/api/health
```
**Expected:**
```json
{
  "status": "ok",
  "message": "Banda Chao Server is running",
  "timestamp": "2025-11-15T..."
}
```

**2. Auth Register:**
```bash
curl -X POST https://banda-chao-backend.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```
**Expected:** User created with token

**3. Auth Login:**
```bash
curl -X POST https://banda-chao-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```
**Expected:** Token and user object returned

**4. Users Me (should return 401 without token):**
```bash
curl https://banda-chao-backend.onrender.com/api/v1/users/me
```
**Expected:**
```json
{
  "error": "Access token required"
}
```

**If any return 404:**
- Check Root Directory is `server`
- Check Start Command is `node dist/index.js`
- Check build logs for errors
- Verify `dist/index.js` exists after build

---

### Step 5: Update Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select project: `banda-chao`
3. Go to: **Settings** → **Environment Variables**
4. Find or add: `NEXT_PUBLIC_API_URL`
5. Set value to: `https://banda-chao-backend.onrender.com`
   - ⚠️ NO trailing slash
   - ⚠️ NO `/api/v1` suffix
6. Click **Save**
7. Select **Production** environment (and Preview/Development if needed)
8. Click **Save** again

---

### Step 6: Redeploy Frontend

**Option A: Manual Redeploy**
1. In Vercel Dashboard → Your Project → **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

**Option B: Push to Git (Auto-deploy)**
1. Make a small change (add a comment)
2. Commit and push
3. Vercel will auto-deploy

---

### Step 7: Test Frontend

**After frontend redeploy:**

1. **Test Register:**
   - Go to: `https://banda-chao.vercel.app/register`
   - Fill form and submit
   - Should create user and redirect

2. **Test Login:**
   - Go to: `https://banda-chao.vercel.app/login`
   - Enter credentials and submit
   - Should log in and redirect

3. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to **Network** tab
   - Try login/register
   - Check API calls:
     - Should go to: `https://banda-chao-backend.onrender.com/api/v1/auth/login`
     - Should return 200 (not 404)

---

## 🚨 Troubleshooting

### If Backend Still Returns 404

**Check Render Logs:**
1. Go to Render Dashboard → Your Service → **Logs** tab
2. Look for:
   - ✅ `Server is running on http://localhost:XXXX` → Good
   - ❌ `Error: Cannot find module 'dist/index.js'` → Build failed
   - ❌ `Error: ENOENT` → Wrong Root Directory

**Common Fixes:**
- Verify Root Directory = `server` (exactly)
- Verify Start Command = `node dist/index.js` (not `npm start`)
- Check build logs for TypeScript errors
- Verify `dist/` folder exists after build

---

### If Frontend Can't Connect

**Check Vercel Environment Variables:**
1. Verify `NEXT_PUBLIC_API_URL` is set
2. Verify value is: `https://banda-chao-backend.onrender.com` (no `/api/v1`)
3. Verify it's set for **Production** environment
4. Redeploy after updating

**Check Browser Console:**
- Open DevTools → Network tab
- Look for API calls
- Check if URL is correct: `https://banda-chao-backend.onrender.com/api/v1/...`
- If URL is wrong → Environment variable is wrong

---

## 📝 Files Modified

### 1. `server/package.json`
**Changed:**
- `"start"` script: Changed from `npx prisma db push --accept-data-loss && node dist/index.js` to `node dist/index.js`
- Added `"start:dev"` script: Kept old command for local dev if needed

**Reason:** Production should not run `prisma db push` (can cause data loss)

---

### 2. `server/render.yaml`
**Changed:**
- `startCommand`: Changed from `npm start` to `node dist/index.js`

**Reason:** `npm start` was running dangerous `prisma db push` command

---

## ✅ Verification Summary

**Backend Code:**
- ✅ All routes exist and are registered correctly
- ✅ Entry point is correct: `server/src/index.ts`
- ✅ Build output is correct: `server/dist/index.js`
- ✅ TypeScript config is correct: `outDir: "./dist"`

**Deployment Config:**
- ✅ `render.yaml` fixed (correct start command)
- ✅ `package.json` fixed (production-safe start script)
- ✅ Build command is correct
- ✅ Root directory is correct

**Frontend Config:**
- ✅ `lib/api.ts` correctly uses `NEXT_PUBLIC_API_URL`
- ✅ Code automatically appends `/api/v1`
- ✅ Vercel env var should be: `https://banda-chao-backend.onrender.com` (no `/api/v1`)

---

## 🎯 Next Steps

1. **Update Render Dashboard** with settings above
2. **Redeploy Backend** (Manual Deploy → Deploy latest commit)
3. **Test Backend** endpoints (health, register, login)
4. **Update Vercel** environment variable (`NEXT_PUBLIC_API_URL`)
5. **Redeploy Frontend**
6. **Test Frontend** (login, register)

**After completing all steps, authentication should work in production!**

---

**Last Updated:** 2025-11-15



