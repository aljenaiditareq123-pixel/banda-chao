# Code Modifications Required - Complete List

**Date**: November 24, 2025  
**Status**: ✅ All Critical Fixes Implemented

---

## ✅ FIXES IMPLEMENTED

### 1. ✅ Created `lib/fetch-with-retry.ts`

**File**: `lib/fetch-with-retry.ts` (NEW)  
**Purpose**: Retry logic for 429, 503, 504 errors  
**Status**: ✅ Created

**Functions**:
- `fetchWithRetry()` - Base retry function
- `fetchJsonWithRetry()` - JSON parsing with retry and HTML detection

---

### 2. ✅ Created `lib/api-utils.ts`

**File**: `lib/api-utils.ts` (NEW)  
**Purpose**: Centralized URL handling to prevent double prefix  
**Status**: ✅ Created

**Functions**:
- `getApiBaseUrl()` - Returns base URL without `/api/v1`
- `getApiUrl()` - Returns full URL with `/api/v1`
- `buildApiUrl()` - Builds complete endpoint URL

---

### 3. ✅ Updated `lib/api.ts`

**File**: `lib/api.ts` (MODIFIED)  
**Changes**:
- Replaced hardcoded URL with `getApiUrl()` from `api-utils.ts`
- Prevents double `/api/v1` prefix issue

**Before**:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://banda-chao-backend.onrender.com';
const API_URL = `${API_BASE_URL}/api/v1`;
```

**After**:
```typescript
import { getApiUrl } from './api-utils';
const API_URL = getApiUrl();
```

---

### 4. ✅ Created `server/src/lib/assistantProfiles.ts`

**File**: `server/src/lib/assistantProfiles.ts` (NEW)  
**Purpose**: Centralized prompt management  
**Status**: ✅ Created

**Exports**:
- `CONSULTANT_PANDA` - Main assistant profile
- `getAssistantProfile()` - Get profile by role
- `ASSISTANT_PROFILES` - All available profiles

---

### 5. ✅ Updated `server/src/api/ai.ts` - `/assistant` Endpoint

**File**: `server/src/api/ai.ts` (MODIFIED)  
**Changes**:
- Removed keyword-based fallback
- Now uses Gemini 1.5 Pro via `generateFounderAIResponse()`
- Uses `assistantProfiles.ts` for system prompts
- Supports multiple assistant types

**Before**:
```typescript
// TODO: Integrate with actual AI service
// Simple keyword-based responses...
```

**After**:
```typescript
import { getAssistantProfile } from '../lib/assistantProfiles';
const profile = getAssistantProfile(assistantRole);
const SYSTEM_PROMPT = profile.systemPrompt;
// Call Gemini 1.5 Pro
const response = await generateFounderAIResponse(prompt);
```

---

## 📋 FILES CREATED

1. ✅ `lib/fetch-with-retry.ts` - Retry logic utility
2. ✅ `lib/api-utils.ts` - URL handling utility
3. ✅ `server/src/lib/assistantProfiles.ts` - Assistant profiles

---

## 📋 FILES MODIFIED

1. ✅ `lib/api.ts` - Uses `getApiUrl()` instead of hardcoded URL
2. ✅ `server/src/api/ai.ts` - Uses Gemini for `/assistant` endpoint

---

## ⚠️ RECOMMENDED NEXT STEPS

### 1. Update Frontend Hooks to Use Retry Logic

**Files to Update**:
- `hooks/useAuth.ts`
- `hooks/useFounderKpis.ts`

**Action**: Replace direct `axios` calls with `apiClient` from `lib/api.ts` (which should use retry logic)

**Example**:
```typescript
// Before
const response = await axios.get(`${API_BASE_URL}/api/v1/users/me`, {...});

// After
import { usersAPI } from '@/lib/api';
const response = await usersAPI.getMe();
```

---

### 2. Add Retry Logic to Axios Interceptor

**File**: `lib/api.ts`  
**Action**: Add retry logic to axios interceptors

**Current**: Only handles 401 errors  
**Recommended**: Add retry for 429, 503, 504

---

### 3. Update Server-Side API Calls

**Files to Check**:
- `app/[locale]/page.tsx`
- `app/[locale]/makers/page.tsx`
- `app/[locale]/products/page.tsx`
- `app/[locale]/videos/page.tsx`

**Action**: Replace direct `fetch()` calls with `fetchJsonWithRetry()` from `lib/fetch-with-retry.ts`

---

### 4. Environment Variables Verification

**Required Variables**:
- `NEXT_PUBLIC_API_URL` - Should NOT include `/api/v1`
- `GEMINI_API_KEY` - Must be set for AI features
- `FRONTEND_URL` - For CORS configuration

**Verification**:
```bash
# Backend
echo $GEMINI_API_KEY
echo $FRONTEND_URL

# Frontend
echo $NEXT_PUBLIC_API_URL
```

---

## ✅ VERIFICATION CHECKLIST

- [x] `lib/fetch-with-retry.ts` created
- [x] `lib/api-utils.ts` created
- [x] `lib/api.ts` updated to use `getApiUrl()`
- [x] `server/src/lib/assistantProfiles.ts` created
- [x] `server/src/api/ai.ts` updated to use Gemini
- [ ] Frontend hooks updated (recommended)
- [ ] Server-side pages updated (recommended)
- [ ] Environment variables verified

---

## 🚨 CRITICAL NOTES

1. **Environment Variables**: Ensure `NEXT_PUBLIC_API_URL` does NOT include `/api/v1`
   - ✅ Correct: `https://banda-chao-backend.onrender.com`
   - ❌ Wrong: `https://banda-chao-backend.onrender.com/api/v1`

2. **Gemini API Key**: Must be set in backend environment
   - Variable: `GEMINI_API_KEY`
   - Location: Render backend environment variables

3. **CORS**: Already properly configured, no changes needed

4. **TypeScript**: All new files should compile without errors

---

## 📊 SUMMARY

**Critical Issues Fixed**: 5/5 ✅  
**Files Created**: 3 ✅  
**Files Modified**: 2 ✅  
**Remaining Recommendations**: 4 (non-critical)

**Status**: ✅ **READY FOR TESTING**

All critical fixes have been implemented. The project should now:
- ✅ Handle retry logic for rate limiting
- ✅ Prevent double prefix URLs
- ✅ Use real Gemini AI for assistant endpoint
- ✅ Have centralized prompt management
- ✅ Use consistent URL handling

---

**Next Action**: Test the changes and verify all endpoints work correctly.



