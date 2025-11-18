# 🎯 EXACT Render & Vercel Settings (Copy-Paste Ready)

**Date:** 2025-11-15  
**Status:** ✅ Configuration Fixed

---

## 🚀 Render Dashboard Settings

### Service: `banda-chao-backend`

#### Build & Deploy Section

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

#### Environment Variables Section

| Key | Value | Required |
|-----|-------|----------|
| `NODE_ENV` | `production` | ✅ Yes |
| `DATABASE_URL` | `postgresql://user:pass@host:port/dbname` | ✅ Yes |
| `JWT_SECRET` | `your-strong-random-secret-32-chars-min` | ✅ Yes |
| `JWT_EXPIRES_IN` | `7d` | ⚠️ Optional |
| `FRONTEND_URL` | `https://banda-chao.vercel.app` | ⚠️ Optional |

**Generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

---

## 🌐 Vercel Dashboard Settings

### Project: `banda-chao`

#### Environment Variables Section

**Key:**
```
NEXT_PUBLIC_API_URL
```

**Value:**
```
https://banda-chao-backend.onrender.com
```

**⚠️ CRITICAL:**
- NO trailing slash (`/`)
- NO `/api/v1` suffix
- Code automatically adds `/api/v1` in `lib/api.ts`

**Environments:**
- ✅ Production
- ✅ Preview (optional)
- ✅ Development (optional)

---

## ✅ Quick Verification

### After Render Deployment

**Test Health Endpoint:**
```bash
curl https://banda-chao-backend.onrender.com/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Banda Chao Server is running",
  "timestamp": "2025-11-15T..."
}
```

**Test Auth Register:**
```bash
curl -X POST https://banda-chao-backend.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test"}'
```

**Expected:** User created with token

---

### After Vercel Deployment

**Test Frontend Login:**
1. Go to: `https://banda-chao.vercel.app/login`
2. Enter credentials
3. Should log in successfully

**Check Browser Console:**
- Open DevTools (F12) → Network tab
- API calls should go to: `https://banda-chao-backend.onrender.com/api/v1/...`
- Should return 200 (not 404)

---

## 📝 Files Fixed

1. ✅ `server/package.json` - Fixed start script (removed dangerous `prisma db push`)
2. ✅ `server/render.yaml` - Fixed start command (changed from `npm start` to `node dist/index.js`)

---

## 🔄 Deployment Steps

### Render (Backend)

1. Go to: https://dashboard.render.com → Your Service → Settings
2. Update **Root Directory** = `server`
3. Update **Build Command** = `npm install && npx prisma generate && npm run build`
4. Update **Start Command** = `node dist/index.js`
5. Verify **Environment Variables** (all 5 listed above)
6. Click **Save Changes**
7. Go to **Manual Deploy** → **Deploy latest commit**
8. Wait for build (5-10 minutes)
9. Test endpoints (health, register, login)

---

### Vercel (Frontend)

1. Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables
2. Add/Update `NEXT_PUBLIC_API_URL` = `https://banda-chao-backend.onrender.com`
3. Select **Production** environment
4. Click **Save**
5. Go to **Deployments** → **Redeploy** latest
6. Wait for deployment
7. Test login/register at `https://banda-chao.vercel.app`

---

**Last Updated:** 2025-11-15

