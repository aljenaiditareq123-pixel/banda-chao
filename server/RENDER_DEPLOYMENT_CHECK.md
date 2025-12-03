# Render Deployment Checklist

## ✅ Required Environment Variables on Render

Make sure these environment variables are set in your Render Dashboard:

### Critical Variables:
1. **DATABASE_URL**
   - Format: `postgresql://user:password@host:port/database?schema=public`
   - Get from: Render PostgreSQL Dashboard → Connection String
   - Example: `postgresql://user:pass@dpg-xxxxx-a.oregon-postgres.render.com/banda_chao?ssl=true`

2. **JWT_SECRET**
   - A secure random string for JWT token signing
   - Generate: `openssl rand -base64 32`
   - Example: `your-super-secret-jwt-key-change-in-production`

3. **FRONTEND_URL**
   - Your frontend URL (if deployed)
   - Example: `https://banda-chao.vercel.app` or `http://localhost:3000` (for local dev)

4. **NODE_ENV**
   - Set to: `production` (for Render)
   - Or: `development` (for local)

### Optional but Recommended:
5. **STRIPE_SECRET_KEY** (if using Stripe)
6. **STRIPE_PUBLISHABLE_KEY** (if using Stripe)
7. **GEMINI_API_KEY** (if using AI features)

---

## 🔍 How to Check Render Deployment

### 1. Check Deployment Status:
- Go to: https://dashboard.render.com
- Navigate to your Web Service
- Check "Events" tab for deployment logs

### 2. Check Environment Variables:
- In Render Dashboard → Your Service → Environment
- Verify all variables are set correctly
- **Important**: DATABASE_URL must point to your Render PostgreSQL instance

### 3. Check Build Logs:
- In Render Dashboard → Your Service → Logs
- Look for:
  - ✅ "Build successful"
  - ✅ "Prisma generate successful"
  - ✅ "Database connection successful"
  - ❌ Any errors about DATABASE_URL
  - ❌ Any Prisma errors

---

## 🐛 Common Issues

### Issue 1: DATABASE_URL Not Set
**Symptom**: "Database connection error"
**Fix**: 
1. Go to Render Dashboard → Environment
2. Add DATABASE_URL from PostgreSQL service
3. Redeploy

### Issue 2: Wrong DATABASE_URL Format
**Symptom**: "Connection refused" or "Invalid connection string"
**Fix**: 
- Ensure format: `postgresql://user:pass@host:port/db?ssl=true`
- Get exact string from Render PostgreSQL Dashboard

### Issue 3: Prisma Client Not Generated
**Symptom**: "Cannot find module '@prisma/client'"
**Fix**: 
- Check `package.json` has `postbuild` script
- Should run: `npx prisma generate`

### Issue 4: Build Fails
**Symptom**: Build timeout or errors
**Fix**:
- Check build logs in Render
- Ensure `package.json` scripts are correct
- Verify Node.js version matches (check `package.json` engines)

---

## 📝 Verification Steps

1. **Check Last Commit is Deployed**:
   ```bash
   # Local
   git log -1 --oneline
   # Should show: 85999af fix: improve database connection error handling
   
   # On Render Dashboard → Deploys
   # Should show same commit hash
   ```

2. **Test Database Connection**:
   - Use Render Shell or check logs
   - Should see: "Database connection successful"

3. **Test API Endpoint**:
   ```bash
   curl https://your-backend.onrender.com/api/v1/health
   # Or check in Render Dashboard → Logs
   ```

---

## 🚀 Quick Fix Commands

If you need to trigger a new deployment:

```bash
# Create empty commit to trigger deploy
git commit --allow-empty -m "trigger: force Render redeploy"
git push origin main
```

---

## 📞 Support

If issues persist:
1. Check Render Status: https://status.render.com
2. Review Render Logs: Dashboard → Your Service → Logs
3. Verify Environment Variables: Dashboard → Your Service → Environment

