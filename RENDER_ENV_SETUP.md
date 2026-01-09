# 🔐 Render Environment Variables Setup Guide

## Critical: Backend Service Must Have JWT_SECRET

The backend is currently crashing because `JWT_SECRET` is not set in Render's environment variables.

## Quick Fix Steps

### 1. Generate a Secure JWT Secret

Run this command locally to generate a secure random secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**OR** use this online tool: https://generate-secret.vercel.app/64

**OR** use any random string generator (minimum 32 characters recommended)

### 2. Set JWT_SECRET in Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Navigate to your **banda-chao-backend** service
3. Click on **Environment** in the left sidebar
4. Click **Add Environment Variable**
5. Add:
   - **Key**: `JWT_SECRET`
   - **Value**: Paste the generated secret from step 1
6. Click **Save Changes**
7. Render will automatically redeploy your service

### 3. Verify All Required Environment Variables

Ensure these are set in your **banda-chao-backend** service:

#### Required (Backend will NOT start without these):
- ✅ `DATABASE_URL` - Should be auto-set from database link
- ❌ `JWT_SECRET` - **MUST BE SET MANUALLY** (see step 2)
- ⚠️ `FRONTEND_URL` - Set to `https://banda-chao-frontend.onrender.com` (optional but recommended)

#### Optional (Backend will start but features won't work):
- `GEMINI_API_KEY` - For AI features (optional)
- `STRIPE_SECRET_KEY` - For payment processing (optional)
- `STRIPE_PUBLISHABLE_KEY` - For payment processing (optional)

### 4. Frontend Service Environment Variables

Ensure these are set in your **banda-chao-frontend** service:

#### Required:
- ✅ `DATABASE_URL` - Should be auto-set from database link
- ✅ `NEXT_PUBLIC_API_URL` - Should be auto-set to backend URL
- ✅ `NEXT_PUBLIC_FRONTEND_URL` - Should be set to `https://banda-chao-frontend.onrender.com`
- ✅ `AUTH_SECRET` - Should be auto-generated (if not, generate using command in step 1)
- ✅ `NEXTAUTH_SECRET` - Legacy support (same as AUTH_SECRET)

#### Optional:
- `GEMINI_API_KEY` - For AI features (optional)

## Verification

After setting `JWT_SECRET`, check the logs:

1. Go to your **banda-chao-backend** service in Render Dashboard
2. Click on **Logs** tab
3. Look for:
   ```
   [ENV CHECK] ✅ All required environment variables are set
   [ENV CHECK] JWT_SECRET: ✅ Set (length: 128)
   ```
4. If you see this, the service should start successfully! ✅

## Troubleshooting

### Issue: Service still crashes after setting JWT_SECRET

**Solution**: 
- Make sure you clicked **Save Changes** after adding the variable
- Wait for the automatic redeploy to complete
- Check that there are no typos in the variable name (`JWT_SECRET` must be exact)
- Ensure the value is not empty (should be at least 32 characters)

### Issue: render.yaml generateValue not working

**Solution**: 
- `generateValue: true` in `render.yaml` only works for NEW services
- For existing services, you must manually set the variable in the dashboard
- Consider using Render's environment variable management UI instead of relying on `generateValue`

### Issue: Want to use render.yaml for all services

**Solution**: 
1. Delete the existing service in Render Dashboard
2. Redeploy using `render.yaml` - it will create new services with auto-generated secrets
3. **Note**: This will require updating any service references/dependencies

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit `JWT_SECRET` to git
- Use different secrets for development and production
- Rotate secrets periodically
- The secret should be at least 32 characters (64+ recommended)
- Use cryptographically secure random generators

## Quick Reference: Required Variables

### Backend Service (`banda-chao-backend`)
```
DATABASE_URL      [Auto-set from database link]
JWT_SECRET        [MANUAL: Generate using crypto.randomBytes(64).toString('hex')]
FRONTEND_URL      https://banda-chao-frontend.onrender.com (optional)
```

### Frontend Service (`banda-chao-frontend`)
```
DATABASE_URL              [Auto-set from database link]
NEXT_PUBLIC_API_URL       [Auto-set from backend service]
NEXT_PUBLIC_FRONTEND_URL  https://banda-chao-frontend.onrender.com
AUTH_SECRET               [Auto-generated or manual]
NEXTAUTH_SECRET           [Same as AUTH_SECRET]
```

## Need Help?

If you're still having issues:
1. Check Render's service logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure the database is linked correctly
4. Try manually redeploying the service
