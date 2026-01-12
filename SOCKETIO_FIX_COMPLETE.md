# Socket.io localhost References - Complete Fix

## Problem
WebSocket errors in production:
```
WebSocket connection to ws://localhost:3001/socket.io/?EIO=4&transport=websocket failed
```

## Root Cause
The `SOCKET_URL` in `lib/socket.ts` was being computed at module load time, which could happen during SSR or build time. This caused it to default to `localhost:3001` even in production.

## Solution

### 1. Made Socket URL Computation Lazy
**File**: `lib/socket.ts`
- Changed from: `const SOCKET_URL = getSocketUrl();` (computed at module load)
- Changed to: Compute `SOCKET_URL` inside `connectSocket()` function (lazy, client-side only)

### 2. Added Client-Side Only Guard
- Added check: `if (typeof window === 'undefined')` at the start of `connectSocket()`
- Throws error if called server-side (prevents SSR issues)
- Added SSR-safe default in `getSocketUrl()` for server-side

### 3. Improved URL Detection
- Enhanced production detection logic
- Checks hostname more carefully (excludes localhost variants)
- Better fallback chain

## Files Changed

1. **`lib/socket.ts`**
   - Made `getSocketUrl()` lazy (called only when needed)
   - Added client-side guard in `connectSocket()`
   - Improved URL detection logic
   - Added better reconnection settings

## Verification

All socket connections now go through `lib/socket.ts`:
- ✅ `app/chat/page.tsx` - Uses `connectSocket()` from `lib/socket`
- ✅ `contexts/NotificationsContext.tsx` - Uses `connectSocket()` from `lib/socket`
- ✅ No direct `io()` calls found in components
- ✅ No direct `new WebSocket()` calls found

## Environment Variables Priority

1. `NEXT_PUBLIC_SOCKET_URL` (dedicated socket URL)
2. `NEXT_PUBLIC_API_URL` (extract base URL)
3. `NEXT_PUBLIC_BACKEND_URL` (direct backend URL)
4. Production detection (if hostname !== localhost)
5. Fallback: `http://localhost:3001` (development only)

## Testing

After deployment:
- ✅ No more `ws://localhost:3001` errors in production console
- ✅ Socket connects to correct production URL
- ✅ Founder Assistant page renders correctly (no blocking socket errors)
- ✅ Notifications work in production
- ✅ Chat works in production

