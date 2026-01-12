# Founder Console - Arabic Only Implementation

## Overview
Made the Founder Console Arabic-only for the Arabic founder. All `/founder/*` pages now:
- Always use Arabic language and RTL layout
- Hide language switcher
- Redirect any locale-prefixed routes to the non-locale version
- Use Arabic labels exclusively

## Changes Made

### 1. Force Arabic Locale for All Founder Pages

**File**: `app/founder/layout.tsx`
- Updated to force `initialLocale="ar"` in Providers
- Disabled Header, Footer, and ChatWidget for founder pages
- Added comment documenting Arabic-only requirement

### 2. Hide Language Switcher in Header

**File**: `components/Header.tsx`
- Added `isFounderPage` check using `usePathname()` hook
- Hide desktop language switcher when `pathname.startsWith('/founder')`
- Hide mobile language switcher when on founder pages
- Founder link in navigation now uses `/founder/assistant` (no locale prefix)

### 3. Redirect Locale-Prefixed Founder Routes

**File**: `middleware.ts`
- Added redirect logic for `/en/founder/*`, `/zh/founder/*`, `/ar/founder/*`
- All redirect to `/founder/*` (non-locale version)
- This ensures founder pages are always accessed without locale prefix

### 4. Update All FounderRoute Components

**Files**: All `app/founder/**/*.tsx` files
- Changed all `FounderRoute locale="en"` to `FounderRoute locale="ar"`
- Updated files:
  - `app/founder/page.tsx`
  - `app/founder/assistant/page-client.tsx`
  - `app/founder/analytics/page.tsx`
  - `app/founder/moderation/page.tsx`
  - `app/founder/assistant/*/page.tsx` (all assistant brain pages)

### 5. Force RTL in FounderConsoleLayout

**File**: `components/founder/FounderConsoleLayout.tsx`
- Always set `isRTL = true` (removed language check)
- Updated placeholder text to always use Arabic
- Removed conditional text based on language

## Routes Affected

All routes under `/founder/*` are now:
- **Arabic-only**: Always use Arabic language
- **RTL-only**: Always use right-to-left layout
- **No language switcher**: Hidden in header when on founder pages
- **Redirected**: `/en/founder/*`, `/zh/founder/*`, `/ar/founder/*` → `/founder/*`

## Testing Checklist

- [x] Build passes without errors
- [ ] Test `/founder/assistant` - should show Arabic RTL layout
- [ ] Test `/en/founder/assistant` - should redirect to `/founder/assistant`
- [ ] Test `/zh/founder/assistant` - should redirect to `/founder/assistant`
- [ ] Test `/ar/founder/assistant` - should redirect to `/founder/assistant`
- [ ] Verify language switcher is hidden on founder pages
- [ ] Verify all labels are in Arabic
- [ ] Verify RTL layout works correctly

## Files Changed

1. `app/founder/layout.tsx` - Force Arabic locale
2. `components/Header.tsx` - Hide language switcher on founder pages
3. `middleware.ts` - Redirect locale-prefixed founder routes
4. `components/founder/FounderConsoleLayout.tsx` - Force RTL and Arabic
5. All `app/founder/**/*.tsx` - Updated locale to "ar"

## Important Notes

- Founder Console is **exclusively for the Arabic founder**
- No other users should access it (protected by auth)
- All founder pages use Arabic labels only
- No English or Chinese text should appear in founder pages
- Language switcher is completely hidden when on founder pages
- All locale-prefixed routes are redirected to non-locale version

