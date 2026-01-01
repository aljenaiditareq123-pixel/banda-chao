# 🚀 How to Add Sentry DSN to Render
# كيفية إضافة Sentry DSN إلى Render

---

## 📋 Prerequisites

- ✅ You have your Sentry DSN (from `SENTRY_DSN_FIND_GUIDE.md`)
- ✅ You have access to Render Dashboard

---

## 🎯 Steps

### Step 1: Open Render Dashboard

1. **Go to:** https://dashboard.render.com
2. **Login** to your account

---

### Step 2: Navigate to Backend Service

1. **From Dashboard:** Click on **"banda-chao-backend"** service
   - Or search for your backend service name

---

### Step 3: Open Environment Variables

1. **In the service page:** Click on **"Environment"** tab (in the left sidebar)
2. **Or:** Click on **"Environment Variables"** section

---

### Step 4: Add SENTRY_DSN

1. **Click:** **"Add Environment Variable"** or **"Add Variable"** button

2. **Enter:**
   - **Key:** `SENTRY_DSN`
   - **Value:** Paste your Sentry DSN (the one you copied from Sentry Dashboard)
     - Format: `https://[key]@[org].ingest.sentry.io/[project-id]`
     - Example: `https://abc123def456@o1234567.ingest.sentry.io/1234567`

3. **Click:** **"Save Changes"** or **"Add"**

---

### Step 5: (Optional) Add Frontend DSN

**If you have a separate Frontend service:**

1. **Go to:** Frontend service (`banda-chao-frontend`)
2. **Open:** Environment Variables
3. **Add:**
   - **Key:** `NEXT_PUBLIC_SENTRY_DSN`
   - **Value:** Your Sentry DSN (can be same as backend or different project)

---

### Step 6: Redeploy

**After adding environment variables:**

1. **Render will automatically redeploy** (usually within 1-2 minutes)
2. **Or manually trigger:** Click **"Manual Deploy"** → **"Deploy latest commit"**

---

### Step 7: Verify

**After deployment:**

1. **Check Render Logs:**
   - Go to **"Logs"** tab in your backend service
   - Look for: `[Sentry] ✅ Error tracking initialized for production`
   - **If you see:** `[Sentry] SENTRY_DSN is not set` → DSN was not added correctly

2. **Test Sentry:**
   - Trigger a test error (e.g., visit a non-existent endpoint)
   - Check Sentry Dashboard → **Issues** tab
   - You should see the error appear in Sentry

---

## 📋 Environment Variables Summary

### Backend Service:
```
SENTRY_DSN=https://[your-dsn-here]
```

### Frontend Service (Optional):
```
NEXT_PUBLIC_SENTRY_DSN=https://[your-dsn-here]
```

---

## ✅ Verification Checklist

- [ ] DSN added to Render Backend environment variables
- [ ] Service redeployed
- [ ] Logs show: `[Sentry] ✅ Error tracking initialized`
- [ ] Test error appears in Sentry Dashboard

---

## 🎯 After Setup

**Sentry will now:**
- ✅ Capture all 500 errors automatically
- ✅ Send error details to Sentry Dashboard
- ✅ Include stack traces and context
- ✅ Track errors in real-time

---

## 💡 Troubleshooting

### If Sentry still not working:

1. **Check DSN Format:**
   - Must start with `https://`
   - Must contain `@` symbol
   - Must end with project ID

2. **Check Render Logs:**
   - Look for Sentry initialization messages
   - Check for any error messages

3. **Verify DSN in Sentry:**
   - Go back to Sentry Dashboard
   - Verify DSN is correct
   - Check if project is active

---

**Ready! Add your DSN to Render and let me know when done! 🚀**

