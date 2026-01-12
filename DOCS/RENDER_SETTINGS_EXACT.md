# 🎯 EXACT Render Settings (Copy-Paste Ready)

## Render Web Service Configuration

### Service Settings

**Service Type:** Web Service  
**Name:** `banda-chao-backend`  
**Environment:** Node  
**Region:** (Choose closest to you)

---

### Build & Deploy Settings

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

### Environment Variables

**Copy these EXACTLY into Render Dashboard:**

| Key | Value | Required |
|-----|-------|----------|
| `NODE_ENV` | `production` | ✅ Yes |
| `DATABASE_URL` | `postgresql://user:pass@host:port/dbname` | ✅ Yes |
| `JWT_SECRET` | `your-strong-random-secret-here` | ✅ Yes |
| `JWT_EXPIRES_IN` | `7d` | ⚠️ Optional |
| `FRONTEND_URL` | `https://banda-chao.vercel.app` | ⚠️ Optional |

**⚠️ Important:**
- `DATABASE_URL` must be your actual PostgreSQL connection string
- `JWT_SECRET` should be a strong random string (32+ characters)
- Generate JWT_SECRET: `openssl rand -base64 32`

---

## Vercel Environment Variables

### Frontend Configuration

**In Vercel Dashboard → Settings → Environment Variables:**

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
- Code adds `/api/v1` automatically

---

## Quick Test URLs

**After deployment, test these:**

1. **Health Check:**
   ```
   https://banda-chao-backend.onrender.com/api/health
   ```

2. **Register:**
   ```
   POST https://banda-chao-backend.onrender.com/api/v1/auth/register
   ```

3. **Login:**
   ```
   POST https://banda-chao-backend.onrender.com/api/v1/auth/login
   ```

4. **Users Me (401 expected without token):**
   ```
   GET https://banda-chao-backend.onrender.com/api/v1/users/me
   ```

---

## Verification Checklist

**After updating Render settings:**

- [ ] Root Directory = `server`
- [ ] Build Command = `npm install && npx prisma generate && npm run build`
- [ ] Start Command = `node dist/index.js`
- [ ] All environment variables set
- [ ] Service redeployed
- [ ] `/api/health` returns `{ status: "ok" }`
- [ ] `/api/v1/auth/register` works
- [ ] `/api/v1/auth/login` works

**After updating Vercel:**

- [ ] `NEXT_PUBLIC_API_URL` = `https://banda-chao-backend.onrender.com` (no `/api/v1`)
- [ ] Frontend redeployed
- [ ] Login at `https://banda-chao.vercel.app/login` works
- [ ] Register at `https://banda-chao.vercel.app/register` works

---

**Last Updated:** 2025-11-15





