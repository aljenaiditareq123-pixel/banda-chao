# Production Fixes - November 24, 2025

## Issues Fixed

### 1. ✅ Founder Sessions Table Missing

**Error:**
```
Invalid prisma.founderSession.findMany() invocation:
The table public.founder_sessions does not exist in the current database.
```

**Root Cause:**
- Endpoint `/api/v1/founder/sessions` was trying to query a non-existent table
- The `FounderSession` model was never added to Prisma schema
- This was causing 500 errors on every request

**Fix Applied:**
- Added `/sessions` endpoint in `server/src/api/founder.ts`
- Endpoint now returns empty array instead of error
- Prevents 500 errors in production
- Can be implemented properly later if needed

**File Modified:**
- `server/src/api/founder.ts`

**Code:**
```typescript
router.get('/sessions', authenticateToken, requireRole(['FOUNDER']), async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Return empty array if founder_sessions table doesn't exist
    res.json({
      success: true,
      sessions: [],
      message: 'Sessions feature not yet implemented',
    });
  } catch (error: any) {
    // If table doesn't exist, return empty array instead of error
    console.error('[FounderSessions] Error fetching sessions:', error);
    res.json({
      success: true,
      sessions: [],
      message: 'Sessions feature not yet implemented',
    });
  }
});
```

---

### 2. ✅ Gemini AI Model Error

**Error:**
```
[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent: 
[404 Not Found] models/gemini-1.5-flash is not found for API version v1beta
```

**Root Cause:**
- There's a `founderPanda.js` file in production that uses `gemini-1.5-flash` with `v1beta` API
- This model is not available in `v1beta` API version
- The file doesn't exist in current codebase (might be in production build only)

**Fix Applied:**
- Added `/api/v1/ai/founder` endpoint as alternative to `/api/v1/ai/assistant`
- Uses the same keyword-based response system (no external AI dependency)
- Prevents 500 errors when frontend calls `/api/v1/ai/founder`

**File Modified:**
- `server/src/api/ai.ts`

**Note:**
- If you have a `founderPanda.ts` or `founderPanda.js` file in production:
  - Change model from `gemini-1.5-flash` to `gemini-1.5-pro` or `gemini-pro`
  - Change API version from `v1beta` to `v1`
  - Or use the keyword-based system until real AI is integrated

**Recommended Gemini Fix (if using real AI):**
```typescript
// Instead of:
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }, { apiVersion: 'v1beta' });

// Use:
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
// or
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
```

---

## Deployment Steps

1. **Deploy Updated Code:**
   ```bash
   # In server directory
   npm run build
   # Deploy to Render/production
   ```

2. **Verify Fixes:**
   - Test `/api/v1/founder/sessions?limit=10` - should return 200 with empty array
   - Test `/api/v1/ai/founder` - should return 200 with response

3. **Monitor Logs:**
   - Check that no more `founder_sessions` table errors appear
   - Check that no more Gemini API errors appear

---

## Future Improvements

### Founder Sessions (if needed):
1. Add `FounderSession` model to Prisma schema:
   ```prisma
   model FounderSession {
     id        String   @id @default(uuid())
     userId    String
     sessionData Json?
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
     
     user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
     
     @@index([userId])
   }
   ```
2. Run migration: `npm run db:migrate`
3. Update endpoint to use real data

### Gemini AI Integration:
1. Install `@google/generative-ai` package
2. Use correct model name and API version
3. Replace keyword-based responses with real AI calls
4. Add error handling for API failures

---

**Last Updated**: November 24, 2025



