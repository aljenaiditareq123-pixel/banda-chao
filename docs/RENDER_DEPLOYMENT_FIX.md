# 🚨 CRITICAL: Render Backend Deployment Fix
## Production Issue: All `/api/v1/*` Routes Return 404

**Date:** 2025-11-15  
**Issue:** Backend on Render is not serving routes correctly  
**Status:** ❌ CRITICAL - Authentication not working in production

---

## 🔍 Root Cause Analysis

### Problem Identified

The backend code is correct, but Render deployment configuration is likely wrong:

1. **Root Directory:** Must be `server` (not root `/`)
2. **Build Command:** Must compile TypeScript to `dist/`
3. **Start Command:** Must run `node dist/index.js` (not `npm run dev`)
4. **Health Endpoint:** Located at `/api/health` (NOT `/api/v1/health`)

### Current Backend Structure

```
banda-chao/
├── server/                    ← Backend is here
│   ├── src/
│   │   ├── index.ts           ← Entry point
│   │   ├── api/
│   │   │   ├── auth.ts        ← ✅ Routes exist
│   │   │   ├── users.ts      ← ✅ Routes exist
│   │   │   ├── orders.ts     ← ✅ Routes exist
│   │   │   └── ...
│   │   └── ...
│   ├── dist/                  ← Build output (after `npm run build`)
│   │   └── index.js           ← Compiled entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── render.yaml            ← Render config (may not be used)
```

### Routes Verification

**✅ All routes ARE registered in `server/src/index.ts`:**

```typescript
app.use('/api/v1/users', userRoutes);      // ✅ Line 80
app.use('/api/v1/auth', authRoutes);      // ✅ Line 86
app.use('/api/v1/orders', orderRoutes);   // ✅ Line 90
// ... all other routes
```

**✅ Health endpoint exists (but at `/api/health`, not `/api/v1/health`):**

```typescript
app.get('/api/health', (req, res) => {     // ✅ Line 67
  res.json({ status: 'ok', ... });
});
```

---

## ✅ Correct Render Configuration

### Render Settings (Web Service)

**Service Type:** Web Service  
**Name:** `banda-chao-backend`  
**Environment:** Node  
**Region:** (Choose closest to your users)

#### Build & Deploy Settings

**Root Directory:** `server`  
**⚠️ CRITICAL:** Must be `server` (not blank, not `/`)

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
node dist/index.js
```

**⚠️ DO NOT USE:** `npm run start` (it runs `prisma db push` which can cause issues)

**Node Version:**
- Minimum: `18.0.0`
- Recommended: `20.x.x` or `18.x.x`

---

### Environment Variables (Required)

**In Render Dashboard → Environment Variables:**

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `DATABASE_URL` | `postgresql://...` | Your PostgreSQL connection string |
| `JWT_SECRET` | `your-secret-key-here` | Strong random string (min 32 chars) |
| `JWT_EXPIRES_IN` | `7d` | Optional (default: 7d) |
| `FRONTEND_URL` | `https://banda-chao.vercel.app` | For CORS |
| `PORT` | (Auto-set by Render) | Render sets this automatically |

**⚠️ Important:**
- `DATABASE_URL` must be a valid PostgreSQL connection string
- `JWT_SECRET` should be a strong random string (use: `openssl rand -base64 32`)
- `FRONTEND_URL` is used for CORS (already in code)

---

## 🔧 Step-by-Step Fix Instructions

### Step 1: Verify Render Service Configuration

1. Go to: https://dashboard.render.com
2. Select your service: `banda-chao-backend`
3. Go to: **Settings** tab
4. Scroll to: **Build & Deploy** section

**Check these settings:**

- [ ] **Root Directory:** Must be `server` (exactly, no leading slash)
- [ ] **Build Command:** `npm install && npx prisma generate && npm run build`
- [ ] **Start Command:** `node dist/index.js` (NOT `npm run start`)

**If any are wrong:**
- Update them
- Click **Save Changes**
- Go to **Manual Deploy** → **Deploy latest commit**

---

### Step 2: Verify Environment Variables

1. In Render Dashboard → Your Service → **Environment** tab
2. Verify these exist:

**Required:**
- [ ] `NODE_ENV` = `production`
- [ ] `DATABASE_URL` = (your PostgreSQL URL)
- [ ] `JWT_SECRET` = (strong random string)

**Optional but recommended:**
- [ ] `JWT_EXPIRES_IN` = `7d`
- [ ] `FRONTEND_URL` = `https://banda-chao.vercel.app`

**If missing:**
- Click **Add Environment Variable**
- Add each one
- Click **Save Changes**

---

### Step 3: Trigger New Deployment

**Option A: Manual Deploy (Recommended)**
1. In Render Dashboard → Your Service
2. Go to **Manual Deploy** tab
3. Click **Deploy latest commit**
4. Wait for build to complete (5-10 minutes)

**Option B: Push to Git (Auto-deploy)**
1. Make a small change (add a comment)
2. Commit and push to your Git repo
3. Render will auto-deploy

---

### Step 4: Verify Build Output

**After deployment, check logs:**

1. In Render Dashboard → Your Service → **Logs** tab
2. Look for:

**✅ Success indicators:**
```
🚀 Server is running on http://localhost:XXXX
📡 WebSocket server is ready
🌍 Environment: production
```

**❌ Error indicators:**
```
Error: Cannot find module 'dist/index.js'
Error: ENOENT: no such file or directory
```

**If you see errors:**
- Check Root Directory is `server`
- Check Build Command includes `npm run build`
- Check that `dist/` folder exists after build

---

### Step 5: Test Backend Endpoints

**After deployment, test these URLs:**

**1. Health Check (should work):**
```
GET https://banda-chao-backend.onrender.com/api/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "message": "Banda Chao Server is running",
  "timestamp": "2025-11-15T..."
}
```

**2. Auth Register (should work):**
```
POST https://banda-chao-backend.onrender.com/api/v1/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123",
  "name": "Test User"
}
```
**Expected Response:**
```json
{
  "message": "User created successfully",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**3. Auth Login (should work):**
```
POST https://banda-chao-backend.onrender.com/api/v1/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123"
}
```
**Expected Response:**
```json
{
  "message": "Login successful",
  "user": { "role": "USER", ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**4. Users Me (should return 401 without token):**
```
GET https://banda-chao-backend.onrender.com/api/v1/users/me
```
**Expected Response (without token):**
```json
{
  "error": "Access token required"
}
```

**If any return 404:**
- Root Directory is wrong (should be `server`)
- Build didn't create `dist/` folder
- Start command is wrong (should be `node dist/index.js`)

---

## 🌐 Frontend Configuration (Vercel)

### NEXT_PUBLIC_API_URL Setting

**Current Code (`lib/api.ts`):**
- Uses `process.env.NEXT_PUBLIC_API_URL` if set
- Falls back to `https://banda-chao-backend.onrender.com/api/v1`

**⚠️ IMPORTANT:** The code adds `/api/v1` automatically, so:

**In Vercel Dashboard → Environment Variables:**

**Key:** `NEXT_PUBLIC_API_URL`  
**Value:** `https://banda-chao-backend.onrender.com`  
**⚠️ DO NOT include `/api/v1`** (code adds it automatically)

**Why:**
- Code does: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
- So if you set: `https://banda-chao-backend.onrender.com/api/v1`
- It becomes: `https://banda-chao-backend.onrender.com/api/v1/api/v1` ❌

---

### Vercel Environment Variables

**Go to:** https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Required:**
- [ ] `NEXT_PUBLIC_API_URL` = `https://banda-chao-backend.onrender.com` (no trailing slash, no `/api/v1`)

**After updating:**
- Click **Save**
- Go to **Deployments** tab
- Click **Redeploy** on latest deployment
- Or push a new commit to trigger redeploy

---

## ✅ Final Checklist

### Backend (Render)

- [ ] Root Directory = `server` (exactly)
- [ ] Build Command = `npm install && npx prisma generate && npm run build`
- [ ] Start Command = `node dist/index.js`
- [ ] Environment Variables:
  - [ ] `NODE_ENV` = `production`
  - [ ] `DATABASE_URL` = (valid PostgreSQL URL)
  - [ ] `JWT_SECRET` = (strong random string)
- [ ] Service is deployed and running
- [ ] Test `/api/health` → Returns `{ status: "ok" }`
- [ ] Test `/api/v1/auth/register` → Creates user
- [ ] Test `/api/v1/auth/login` → Returns token

### Frontend (Vercel)

- [ ] `NEXT_PUBLIC_API_URL` = `https://banda-chao-backend.onrender.com` (no `/api/v1`)
- [ ] Frontend is redeployed after env var change
- [ ] Test login at `https://banda-chao.vercel.app/login` → Works
- [ ] Test register at `https://banda-chao.vercel.app/register` → Works

---

## 🧪 Testing Commands

### Test Backend Health
```bash
curl https://banda-chao-backend.onrender.com/api/health
```

### Test Auth Register
```bash
curl -X POST https://banda-chao-backend.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test"}'
```

### Test Auth Login
```bash
curl -X POST https://banda-chao-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Test Users Me (should return 401)
```bash
curl https://banda-chao-backend.onrender.com/api/v1/users/me
```

### Test Users Me (with token)
```bash
curl https://banda-chao-backend.onrender.com/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🚨 Common Issues & Solutions

### Issue 1: All Routes Return 404

**Cause:** Root Directory is wrong or Start Command is wrong

**Fix:**
- Root Directory must be: `server` (exactly)
- Start Command must be: `node dist/index.js`
- Build Command must include: `npm run build`

---

### Issue 2: Build Fails

**Cause:** Missing dependencies or Prisma not generated

**Fix:**
- Build Command must include: `npx prisma generate`
- Check that `DATABASE_URL` is set correctly
- Check Node version (should be 18+)

---

### Issue 3: "Cannot find module 'dist/index.js'"

**Cause:** Build didn't create `dist/` folder

**Fix:**
- Check Build Command includes: `npm run build`
- Check `tsconfig.json` has `"outDir": "./dist"`
- Check build logs for TypeScript errors

---

### Issue 4: Database Connection Errors

**Cause:** `DATABASE_URL` is wrong or database is not accessible

**Fix:**
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/dbname`
- Check database is running and accessible
- Check firewall/network settings

---

### Issue 5: CORS Errors in Frontend

**Cause:** Backend CORS not allowing Vercel domain

**Fix:**
- Backend code already allows `https://banda-chao.vercel.app` (line 32 in `server/src/index.ts`)
- If still failing, check `FRONTEND_URL` env var matches

---

## 📋 Summary

**The issue is:** Render is not using the correct Root Directory or Build/Start commands.

**The fix is:**
1. Set Root Directory = `server`
2. Set Build Command = `npm install && npx prisma generate && npm run build`
3. Set Start Command = `node dist/index.js`
4. Set Environment Variables correctly
5. Redeploy

**After fix:**
- `/api/health` should work
- `/api/v1/auth/register` should work
- `/api/v1/auth/login` should work
- `/api/v1/users/me` should work (with token)

---

**Last Updated:** 2025-11-15

