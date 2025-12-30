# 🔗 BANDA CHAO - CONNECTION MANIFESTO
## Architecture & URL Configuration Guide

**Last Updated:** December 30, 2024  
**Purpose:** Definitive guide to Frontend/Backend connections and URL configuration

---

## 📋 EXECUTIVE SUMMARY

**Banda Chao** uses a **separate services architecture**:
- **Frontend Service** (Next.js): Serves the user interface
- **Backend Service** (Express/Node): Provides API endpoints

These services **MUST** communicate over the public internet via HTTPS URLs. The Frontend **REQUIRES** the Backend URL to function correctly.

---

## 🌐 SERVICE URLs (Production - Render)

### Frontend Service
- **Service Name:** `banda-chao-frontend`
- **Public URL:** `https://banda-chao-frontend.onrender.com`
- **Purpose:** Serves Next.js application (HTML, CSS, JavaScript)
- **Does NOT expose API endpoints**

### Backend Service
- **Service Name:** `banda-chao-backend`
- **Public URL:** `https://banda-chao-backend.onrender.com`
- **Purpose:** Provides REST API at `/api/v1/*` endpoints
- **Does NOT serve frontend pages**

---

## 🔑 CRITICAL ENVIRONMENT VARIABLES

### Frontend Service (`banda-chao-frontend`) - REQUIRED

```bash
# BACKEND URL - CRITICAL: This tells the frontend where the API is
NEXT_PUBLIC_API_URL=https://banda-chao-backend.onrender.com

# FRONTEND URL - For metadata and redirects
NEXT_PUBLIC_FRONTEND_URL=https://banda-chao-frontend.onrender.com
NEXTAUTH_URL=https://banda-chao-frontend.onrender.com
AUTH_URL=https://banda-chao-frontend.onrender.com

# Secrets (shared with backend)
AUTH_SECRET=<same-secret-as-backend>
NEXTAUTH_SECRET=<same-secret-as-backend>
```

### Backend Service (`banda-chao-backend`) - REQUIRED

```bash
# FRONTEND URL - For CORS configuration
FRONTEND_URL=https://banda-chao-frontend.onrender.com

# Secrets
JWT_SECRET=<same-secret-as-frontend>
```

---

## 🏗️ ARCHITECTURAL FLOW

### 1. User Request Flow
```
User Browser
    ↓
https://banda-chao-frontend.onrender.com/ar/login
    ↓
Next.js Frontend (SSR/Client-side)
    ↓
[API Call via axios]
    ↓
https://banda-chao-backend.onrender.com/api/v1/auth/login
    ↓
Express Backend
    ↓
PostgreSQL Database
```

### 2. Why Frontend Needs Backend URL

**The Frontend is a CLIENT that consumes a separate API service.**

- Next.js renders pages on the server (SSR) and client
- During SSR, pages fetch data from the Backend API
- Client-side code (React components) also calls the Backend API
- **Without `NEXT_PUBLIC_API_URL`, the Frontend doesn't know where the API is**

### 3. Authentication Flow

**NOT using NextAuth for API authentication:**
- Login uses custom `authAPI.login()` (calls `/api/v1/auth/login`)
- JWT token stored in `localStorage` as `auth_token`
- Token sent in `Authorization: Bearer <token>` header
- NextAuth is only used for OAuth providers (Google, Facebook, etc.)

**Server-Side vs Client-Side:**
- All API calls are made **client-side** via `axios` or `fetch`
- No server-to-server calls between Frontend and Backend
- Both services communicate over **public HTTPS URLs**

---

## ⚠️ COMMON MISTAKES & FIXES

### ❌ MISTAKE 1: Removing `NEXT_PUBLIC_API_URL` from Frontend
**Problem:** Frontend tries to call itself (`window.location.origin`) or uses hardcoded fallback
**Fix:** **ALWAYS** set `NEXT_PUBLIC_API_URL=https://banda-chao-backend.onrender.com` in Frontend

### ❌ MISTAKE 2: Using Frontend URL as API URL
**Problem:** `NEXT_PUBLIC_API_URL=https://banda-chao-frontend.onrender.com` causes Frontend to call itself → 404 HTML instead of JSON
**Fix:** Use Backend URL: `NEXT_PUBLIC_API_URL=https://banda-chao-backend.onrender.com`

### ❌ MISTAKE 3: Hardcoded `localhost:3001` Fallbacks
**Problem:** Code assumes local development when env var is missing
**Fix:** Use `getApiBaseUrl()` utility function (falls back to production Backend URL)

### ❌ MISTAKE 4: Assuming Services Can Talk via Internal Network
**Problem:** Render services are separate and communicate over public internet
**Fix:** Always use public HTTPS URLs

---

## 📝 CODE PATTERNS

### ✅ CORRECT: Using API Utility Function
```typescript
import { getApiUrl } from '@/lib/api-utils';

// This automatically uses NEXT_PUBLIC_API_URL or falls back correctly
const API_URL = getApiUrl(); // https://banda-chao-backend.onrender.com/api/v1
```

### ✅ CORRECT: Using API Client
```typescript
import { authAPI } from '@/lib/api';

// This uses the centralized API client (already configured)
const response = await authAPI.login({ email, password });
```

### ❌ WRONG: Hardcoded URLs
```typescript
// DON'T DO THIS:
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://banda-chao.onrender.com';
```

---

## 🧪 TESTING CONNECTIONS

### Test Backend API
```bash
curl https://banda-chao-backend.onrender.com/api/v1/products?limit=1
# Should return: {"products":[...],"pagination":{...}}
```

### Test Frontend
```bash
curl https://banda-chao-frontend.onrender.com/ar/login
# Should return: HTML page (not JSON)
```

### Test API Call from Frontend
1. Open browser console on `https://banda-chao-frontend.onrender.com/ar/login`
2. Check Network tab for requests to `banda-chao-backend.onrender.com`
3. Should see JSON responses, not 404 HTML pages

---

## 🔧 DEPLOYMENT CHECKLIST

### Frontend Service (`banda-chao-frontend`)
- [ ] `NEXT_PUBLIC_API_URL` = `https://banda-chao-backend.onrender.com`
- [ ] `NEXT_PUBLIC_FRONTEND_URL` = `https://banda-chao-frontend.onrender.com`
- [ ] `NEXTAUTH_URL` = `https://banda-chao-frontend.onrender.com`
- [ ] `AUTH_SECRET` set (same as backend)
- [ ] `NEXTAUTH_SECRET` set (same as backend)

### Backend Service (`banda-chao-backend`)
- [ ] `FRONTEND_URL` = `https://banda-chao-frontend.onrender.com`
- [ ] `JWT_SECRET` set (same as frontend secrets)
- [ ] `DATABASE_URL` set (from Render database)
- [ ] `PORT` = `10000` (or auto-set by Render)

### Verification
- [ ] Backend health check: `curl https://banda-chao-backend.onrender.com/api/health` → `OK`
- [ ] Frontend loads without errors
- [ ] Login page doesn't show 404 errors in console
- [ ] API calls return JSON (not HTML)

---

## 🚨 TROUBLESHOOTING

### Error: "404 Not Found" when calling API
**Cause:** Frontend is calling itself (wrong `NEXT_PUBLIC_API_URL`)
**Fix:** Set `NEXT_PUBLIC_API_URL=https://banda-chao-backend.onrender.com` in Frontend env vars

### Error: "CORS Error" in browser
**Cause:** Backend CORS not allowing Frontend origin
**Fix:** Verify `FRONTEND_URL=https://banda-chao-frontend.onrender.com` in Backend env vars

### Error: "HTML response instead of JSON"
**Cause:** Request going to Frontend instead of Backend
**Fix:** Check `NEXT_PUBLIC_API_URL` is set to Backend URL (not Frontend URL)

---

## 📚 FILES REFERENCE

### API URL Utilities
- `lib/api-utils.ts` - `getApiBaseUrl()`, `getApiUrl()` - **USE THESE**
- `lib/api.ts` - Axios client (uses `getApiUrl()`)

### Files That MUST Use API Utilities (Fixed)
- `app/admin/products/page-client.tsx`
- `app/admin/company-settings/page-client.tsx`
- `app/[locale]/messages/[conversationId]/page.tsx`
- `app/actions/productActions.ts`
- `components/admin/ProductFormModal.tsx`
- All other files making direct API calls

---

## 🎯 BOTTOM LINE

1. **Frontend URL:** `https://banda-chao-frontend.onrender.com` (serves pages)
2. **Backend URL:** `https://banda-chao-backend.onrender.com` (serves API)
3. **Frontend MUST have:** `NEXT_PUBLIC_API_URL=https://banda-chao-backend.onrender.com`
4. **Backend MUST have:** `FRONTEND_URL=https://banda-chao-frontend.onrender.com`
5. **Always use:** `getApiBaseUrl()` / `getApiUrl()` utilities (never hardcode)

**These are SEPARATE SERVICES on SEPARATE URLs. They communicate over the PUBLIC INTERNET via HTTPS.**
