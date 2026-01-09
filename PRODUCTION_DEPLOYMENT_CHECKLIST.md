# ✅ Production Deployment Checklist - Banda Chao

**Use this checklist before and after deploying to production on Render**

---

## 📋 Pre-Deployment Checklist

### 1. Code Quality
- [ ] All TypeScript errors resolved (or verified acceptable with `ignoreBuildErrors`)
- [ ] No console errors in development build
- [ ] All linting warnings addressed or documented
- [ ] Code review completed (if applicable)

### 2. Database
- [ ] Prisma schemas are synchronized (`scripts/sync-prisma-schemas.sh`)
- [ ] Migration files are created and tested locally
- [ ] Database backup created (if updating existing data)
- [ ] Migration rollback plan prepared

### 3. Environment Variables - Backend
- [ ] `DATABASE_URL` - PostgreSQL connection string (from Render)
- [ ] `JWT_SECRET` - Strong random secret (32+ characters)
- [ ] `JWT_EXPIRES_IN` - Token expiration (default: "7d")
- [ ] `FRONTEND_URL` - Frontend production URL
- [ ] `NODE_ENV` - Set to "production"
- [ ] `STRIPE_SECRET_KEY` - If using Stripe (starts with `sk_live_`)
- [ ] `STRIPE_PUBLISHABLE_KEY` - If using Stripe (starts with `pk_live_`)
- [ ] `STRIPE_MODE` - Set to "production"
- [ ] `GCLOUD_PROJECT_ID` - If using GCS
- [ ] `GCS_BUCKET_NAME` - If using GCS
- [ ] `GCS_SERVICE_ACCOUNT_KEY` - If using GCS (JSON key)
- [ ] `GEMINI_API_KEY` - If using AI features
- [ ] `SENTRY_DSN` - If using error tracking

**Validation:**
```bash
# Run validation script
node scripts/validate-env-vars.js backend
```

### 4. Environment Variables - Frontend
- [ ] `NEXT_PUBLIC_API_URL` - Backend API URL
- [ ] `NEXT_PUBLIC_FRONTEND_URL` - Frontend URL
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - If using Stripe
- [ ] `AUTH_URL` - NextAuth URL (same as frontend URL)
- [ ] `AUTH_SECRET` - Auto-generated or manually set
- [ ] `NEXTAUTH_URL` - Legacy NextAuth URL (same as frontend)
- [ ] `NEXTAUTH_SECRET` - Legacy NextAuth secret
- [ ] `DATABASE_URL` - If frontend uses Prisma
- [ ] `NODE_ENV` - Set to "production"
- [ ] `PORT` - Set to "3000"

**Validation:**
```bash
# Run validation script
node scripts/validate-env-vars.js frontend
```

### 5. Configuration Files
- [ ] `render.yaml` is up to date with correct build/start commands
- [ ] `next.config.js` has correct production settings
- [ ] `server/src/index.ts` CORS configuration is production-ready
- [ ] No hardcoded secrets or API keys in code
- [ ] `.env` files are gitignored

### 6. Security
- [ ] CORS allows only production frontend URL (no wildcards)
- [ ] CSRF protection is enabled
- [ ] Rate limiting is configured
- [ ] Authentication tokens are secure
- [ ] All secrets are in environment variables (not hardcoded)

### 7. Build Commands Verification
- [ ] Backend build command tested locally
- [ ] Frontend build command tested locally
- [ ] Both builds complete without errors
- [ ] Static assets copy correctly in standalone mode

---

## 🚀 Deployment Steps

### Step 1: Sync Prisma Schemas
```bash
# Ensure schemas are synchronized
./scripts/sync-prisma-schemas.sh

# Verify schemas match
diff prisma/schema.prisma server/prisma/schema.prisma
```

### Step 2: Validate Environment Variables
```bash
# Validate all environment variables
node scripts/validate-env-vars.js all
```

### Step 3: Deploy Backend
1. Push changes to GitHub (triggers auto-deploy on Render)
2. Monitor build logs in Render Dashboard
3. Verify:
   - [ ] Build completes successfully
   - [ ] Prisma migrations deploy
   - [ ] Server starts without errors
   - [ ] Health check responds: `curl https://banda-chao-backend.onrender.com/api/health`

### Step 4: Deploy Frontend
1. Push changes to GitHub (triggers auto-deploy on Render)
2. Monitor build logs in Render Dashboard
3. Verify:
   - [ ] Build completes successfully
   - [ ] No hydration mismatches in logs
   - [ ] Static assets are copied correctly
   - [ ] Health check responds: `curl https://banda-chao-frontend.onrender.com/health`

---

## ✅ Post-Deployment Verification

### 1. Health Checks
```bash
# Run automated health check script
BACKEND_URL=https://banda-chao-backend.onrender.com \
FRONTEND_URL=https://banda-chao-frontend.onrender.com \
./scripts/health-check.sh
```

**Manual Checks:**
- [ ] Backend health: `curl https://banda-chao-backend.onrender.com/api/health`
  - Expected: `OK`
- [ ] Frontend health: `curl https://banda-chao-frontend.onrender.com/health`
  - Expected: `OK`
- [ ] Frontend homepage loads: Open in browser
- [ ] Backend API responds: Test with Postman/curl

### 2. Integration Tests
- [ ] Frontend can connect to backend API
- [ ] Authentication flow works (login/signup)
- [ ] CORS allows frontend origin
- [ ] API routes respond correctly
- [ ] Static assets load correctly
- [ ] Images and fonts load properly

### 3. Critical User Flows
- [ ] User registration
- [ ] User login
- [ ] Product browsing
- [ ] Maker dashboard access
- [ ] Order creation (if applicable)
- [ ] Payment flow (if applicable)

### 4. Error Monitoring
- [ ] Check Render logs for errors
- [ ] Check Sentry for errors (if configured)
- [ ] Verify no CORS errors in browser console
- [ ] Verify no hydration warnings in console

### 5. Performance
- [ ] Page load times are acceptable
- [ ] API response times are reasonable
- [ ] Database queries are optimized
- [ ] No memory leaks or excessive resource usage

---

## 🐛 Troubleshooting Guide

### Issue: Build Fails
**Symptoms:** Build fails during npm install or build step

**Check:**
1. Node version matches (20.x)
2. All dependencies are compatible
3. No TypeScript errors (if not ignoring)
4. Prisma generate succeeds

**Solution:**
```bash
# Test build locally first
cd server && npm install --legacy-peer-deps && npm run build
cd .. && npm install --legacy-peer-deps && npm run build
```

### Issue: Migration Fails
**Symptoms:** "Column does not exist" or migration errors

**Check:**
1. Schemas are synchronized
2. Migration files are correct
3. Database connection is valid

**Solution:**
```bash
# In Render Shell (Backend service)
cd server
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss
```

### Issue: CORS Errors
**Symptoms:** 403 Forbidden or CORS errors in browser

**Check:**
1. `FRONTEND_URL` is set correctly in backend
2. Frontend origin is in allowed origins list
3. CORS middleware is not bypassed

**Solution:**
- Verify `FRONTEND_URL` matches actual frontend URL
- Check `server/src/index.ts` CORS configuration
- Test with: `curl -H "Origin: <frontend-url>" -X OPTIONS <backend-url>/api/v1/auth/login`

### Issue: Hydration Mismatch
**Symptoms:** React hydration warnings in console

**Check:**
1. Server and client render same content
2. No `Date.now()` or `Math.random()` in server components
3. No browser APIs in server components

**Solution:**
- Use `useEffect` for client-only code
- Use `suppressHydrationWarning` if intentional mismatch
- Ensure consistent data between server and client

### Issue: Environment Variables Not Available
**Symptoms:** Variables are undefined at runtime

**Check:**
1. Variables are set in Render Dashboard
2. Variable names are correct (case-sensitive)
3. Service was redeployed after adding variables

**Solution:**
- Verify variables in Render Dashboard → Environment
- Redeploy service after adding variables
- Use validation script to check: `node scripts/validate-env-vars.js`

---

## 📊 Monitoring Checklist

After deployment, monitor for:
- [ ] Application uptime (use Render dashboard)
- [ ] Error rates (check Render logs)
- [ ] Response times (check Render metrics)
- [ ] Database performance (check PostgreSQL metrics)
- [ ] User-reported issues (monitor support channels)

---

## 🔄 Rollback Plan

If deployment fails:

1. **Backend Rollback:**
   - Go to Render Dashboard → Backend Service → Deploys
   - Find last successful deploy
   - Click "Rollback" or redeploy previous commit

2. **Frontend Rollback:**
   - Go to Render Dashboard → Frontend Service → Deploys
   - Find last successful deploy
   - Click "Rollback" or redeploy previous commit

3. **Database Rollback:**
   - If migration was applied, restore from backup
   - Use `prisma migrate resolve --rolled-back <migration-name>` if needed

---

## 📝 Deployment Notes

**Date:** _______________  
**Deployed By:** _______________  
**Git Commit:** _______________  
**Environment:** Production  
**Services Deployed:**
- [ ] Backend
- [ ] Frontend
- [ ] Database migrations

**Issues Encountered:**
_____________________________________________
_____________________________________________
_____________________________________________

**Resolution:**
_____________________________________________
_____________________________________________
_____________________________________________

---

**Last Updated:** January 2025  
**Related Documents:**
- `PRODUCTION_STABILIZATION_PLAN.md` - Detailed stabilization guide
- `RENDER_DEPLOYMENT_GUIDE.md` - Render-specific deployment guide
- `scripts/health-check.sh` - Automated health check script
