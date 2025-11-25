# Production Build Fix - Critical Issues

**Date**: November 24, 2025  
**Status**: ⚠️ Production Build Contains Old Files

---

## Problem Analysis

Based on production logs, there are **two critical issues**:

### 1. ❌ Old `founder-sessions.js` File in Production

**Error in Logs:**
```
Invalid prisma.founderSession.findMany() invocation:
The table public.founder_sessions does not exist in the current database.
at /opt/render/project/src/server/dist/api/founder-sessions.js:101:26
```

**Root Cause:**
- Production build contains `founder-sessions.js` file that doesn't exist in current codebase
- This file tries to query `prisma.founderSession.findMany()` which requires a non-existent table
- Current codebase has `/sessions` endpoint in `founder.ts` that returns empty array (correct fix)

**Solution:**
- The `/sessions` endpoint in `founder.ts` is already fixed ✅
- But production build still has old `founder-sessions.js` file
- **Action Required**: Rebuild and redeploy to remove old file

---

### 2. ❌ Old `founderPanda.js` File in Production

**Error in Logs:**
```
[FounderPanda] Error generating response: GoogleGenerativeAIFetchError: 
Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent: 
[404 Not Found] models/gemini-1.5-flash is not found for API version v1beta
at /opt/render/project/src/server/dist/lib/founderPanda.js:286:28
```

**Root Cause:**
- Production build contains `founderPanda.js` file that uses:
  - ❌ `gemini-1.5-flash` (wrong model)
  - ❌ `v1beta` API version (wrong version)
- Current codebase uses:
  - ✅ `gemini-1.5-pro` (correct model)
  - ✅ `v1` API version (default, correct)
  - ✅ `server/src/lib/gemini.ts` (new file)
  - ✅ `server/src/api/ai.ts` with `/founder` endpoint (updated)

**Solution:**
- Current codebase is correct ✅
- But production build still has old `founderPanda.js` file
- **Action Required**: Rebuild and redeploy to use new `gemini.ts` file

---

## Current Codebase Status

### ✅ Files That Are Correct:

1. **`server/src/lib/gemini.ts`** (NEW)
   - Uses `gemini-1.5-pro`
   - Uses default API version (v1)
   - Exports `generateFounderAIResponse()`

2. **`server/src/api/ai.ts`**
   - `/founder` endpoint uses `generateFounderAIResponse()` from `gemini.ts`
   - No references to `founderPanda` or old code

3. **`server/src/api/founder.ts`**
   - `/sessions` endpoint returns empty array (prevents 500 errors)
   - No references to `prisma.founderSession`

### ❌ Files That Should NOT Exist in Production:

1. **`dist/api/founder-sessions.js`** (OLD - should be removed)
2. **`dist/lib/founderPanda.js`** (OLD - should be removed)

---

## Deployment Steps

### Step 1: Clean Build

```bash
cd server
rm -rf dist node_modules/.cache
npm install
npm run build
```

### Step 2: Verify Build Output

Check that `dist/` folder contains:
- ✅ `dist/lib/gemini.js` (NEW)
- ✅ `dist/api/ai.js` (updated)
- ✅ `dist/api/founder.js` (updated)
- ❌ NO `dist/api/founder-sessions.js` (should not exist)
- ❌ NO `dist/lib/founderPanda.js` (should not exist)

### Step 3: Deploy to Render

1. Push changes to Git
2. Render will automatically rebuild
3. Or manually trigger rebuild in Render dashboard

### Step 4: Verify After Deployment

Check production logs for:
- ✅ No more `founder-sessions` errors
- ✅ No more `gemini-1.5-flash` errors
- ✅ Successful Gemini API calls with `gemini-1.5-pro`

---

## Verification Commands

### Check for Old Files:
```bash
# In server directory
find dist -name "*founder-sessions*" -o -name "*founderPanda*"
# Should return nothing if build is clean
```

### Check Build Output:
```bash
# In server directory
ls -la dist/lib/
# Should show: gemini.js (NOT founderPanda.js)

ls -la dist/api/
# Should show: founder.js (NOT founder-sessions.js)
```

---

## Expected Behavior After Fix

### `/api/v1/founder/sessions`:
- **Before**: 500 error (table doesn't exist)
- **After**: 200 OK with `{ success: true, sessions: [] }`

### `/api/v1/ai/founder`:
- **Before**: 500 error (gemini-1.5-flash not found)
- **After**: 200 OK with real Gemini 1.5 Pro response

---

## Summary

**Current Codebase**: ✅ Correct  
**Production Build**: ❌ Contains old files  
**Action Required**: Rebuild and redeploy

The code changes are correct, but production needs a fresh build to remove old compiled files.

---

**Last Updated**: November 24, 2025


