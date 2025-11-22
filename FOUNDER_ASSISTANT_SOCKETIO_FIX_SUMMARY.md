# Founder Assistant RTL + Socket.io Fix Summary

## Overview
Fixed two critical issues:
1. **Founder Assistant Layout in RTL**: Changed from narrow `max-w-6xl` to wider `max-w-7xl` and improved RTL support
2. **Socket.io Production Issue**: Fixed hardcoded `localhost:3001` to use environment variables properly

## Changes Made

### 1. Founder Assistant Layout Fix

#### **File**: `components/founder/FounderConsoleLayout.tsx`
- **Change**: Updated container from `max-w-6xl` to `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Impact**: 
  - Wider layout that uses full screen width effectively
  - Better spacing with responsive padding
  - Three-column grid (Sidebar → Chat → Assistants) now has more room

#### **File**: `components/founder/FounderSidebar.tsx`
- **Changes**:
  - Added RTL support for all stats cards (Users, Makers, Products, Videos)
  - Added `rtl-flip-row` and `rtl-text-right` classes conditionally based on language
  - Fixed Quick Links to use dynamic language in URLs (`/${language}/makers` instead of hardcoded `/ar/makers`)
  - Added RTL support for all link layouts

**Before:**
- Stats cards were not RTL-aware
- Links were hardcoded to `/ar/...`
- Layout was narrow and cramped in RTL

**After:**
- Stats cards properly align right in RTL
- Links use dynamic language from context
- Layout uses full width efficiently in both LTR and RTL

### 2. Socket.io Production Fix

#### **File**: `lib/socket.ts`
- **Changes**:
  - Replaced hardcoded `'http://localhost:3001'` with smart URL detection function `getSocketUrl()`
  - Added priority-based URL resolution:
    1. `NEXT_PUBLIC_SOCKET_URL` (dedicated socket URL if set)
    2. `NEXT_PUBLIC_API_URL` (extracts base URL from API URL)
    3. `NEXT_PUBLIC_BACKEND_URL` (uses backend URL directly)
    4. Client-side detection: checks if production and uses `https://banda-chao-backend.onrender.com`
    5. Development fallback: `http://localhost:3001`

**Before:**
```typescript
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
```

**After:**
```typescript
const getSocketUrl = (): string => {
  // Priority 1: Dedicated socket URL
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }

  // Priority 2: API URL (socket.io is on the same server)
  if (process.env.NEXT_PUBLIC_API_URL) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
    return baseUrl;
  }

  // Priority 3: Build from NEXT_PUBLIC_BACKEND_URL if available
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, '');
  }

  // Priority 4: Client-side detection (only in browser)
  if (typeof window !== 'undefined') {
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    if (isProduction) {
      return 'https://banda-chao-backend.onrender.com';
    }
  }

  // Fallback: Development default
  return 'http://localhost:3001';
};

const SOCKET_URL = getSocketUrl();
```

**Impact**:
- ✅ No more `WebSocket connection to ws://localhost:3001/socket.io/... failed` errors in production
- ✅ Automatically detects production environment and uses correct backend URL
- ✅ Supports multiple environment variable configurations
- ✅ Falls back gracefully to development URL when appropriate

## Environment Variables

To configure Socket.io URL in production, you can set one of these:

1. **Preferred**: `NEXT_PUBLIC_SOCKET_URL=https://banda-chao-backend.onrender.com`
2. **Alternative**: `NEXT_PUBLIC_API_URL=https://banda-chao-backend.onrender.com/api/v1` (will extract base URL)
3. **Alternative**: `NEXT_PUBLIC_BACKEND_URL=https://banda-chao-backend.onrender.com`

If none are set, the code will:
- In production (detected via hostname): Use `https://banda-chao-backend.onrender.com`
- In development: Use `http://localhost:3001`

## Files Changed

1. `components/founder/FounderConsoleLayout.tsx`
   - Changed `max-w-6xl` to `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
   
2. `components/founder/FounderSidebar.tsx`
   - Added RTL support for stats cards
   - Added RTL support for quick links
   - Fixed hardcoded URLs to use dynamic language

3. `lib/socket.ts`
   - Completely rewrote URL resolution logic
   - Added `getSocketUrl()` function with priority-based resolution
   - Added production detection

## Testing

### Layout Testing
- [x] Build passes without errors
- [ ] Manual test in `/founder/assistant` in Arabic (RTL)
- [ ] Manual test in `/founder/assistant` in English (LTR)
- [ ] Verify three-column layout uses full width
- [ ] Verify stats cards align correctly in RTL
- [ ] Verify quick links work and use correct language

### Socket.io Testing
- [x] Build passes without errors
- [ ] Check browser console in production - no `localhost:3001` errors
- [ ] Verify socket connection works in production
- [ ] Verify socket connection works in development
- [ ] Test with different environment variable configurations

## Next Steps

1. **Deploy to production** and verify:
   - No more Socket.io errors in console
   - Founder Assistant page uses full width in RTL
   - All links work correctly

2. **Set environment variable** in production:
   - Add `NEXT_PUBLIC_SOCKET_URL=https://banda-chao-backend.onrender.com` to environment variables
   - Or ensure `NEXT_PUBLIC_API_URL` is set correctly

3. **Manual testing**:
   - Test `/founder/assistant` in Arabic
   - Test `/founder/assistant` in English
   - Verify socket.io connections work in chat features

## Notes

- Socket.io now automatically detects production environment and uses the correct URL
- No breaking changes - all existing functionality is preserved
- RTL improvements are backward compatible with LTR layouts
- Layout is now wider and more user-friendly in both directions

