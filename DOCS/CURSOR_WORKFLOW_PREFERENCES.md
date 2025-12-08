# 🎯 Cursor Workflow Preferences - Banda Chao Project

**Last Updated:** 2025-12-08  
**Status:** Active Preferences

---

## ✅ Automatic Commit & Push

**Preference:** Always automatically commit and push code changes.

**Implementation:**
- After any code modification, automatically:
  1. `git add .`
  2. `git commit -m "descriptive message"`
  3. `git push`

**Rationale:** Prevents forgetting to save changes and causing deployment issues.

---

## 🧹 Code Quality & Conflict Prevention

**Preference:** Maintain clean codebase, prevent conflicts from previous AI assistants.

**Responsibilities:**
1. **Conflict Detection:**
   - Scan for old Manos/ChatGPT/Gemini conflicting code
   - Identify duplicate implementations
   - Flag controversial or problematic changes

2. **Automatic Cleanup:**
   - Remove old/unused code ("old sheep")
   - Clean up duplicate files
   - Remove deprecated dependencies
   - Keep codebase clean and maintainable

3. **Quality Control:**
   - Block problematic changes
   - Warn about controversial implementations
   - Ensure consistency across codebase
   - Maintain project integrity

4. **Project Knowledge:**
   - Full understanding from beginning to end
   - Know correct patterns and conventions
   - Maintain architectural consistency
   - Prevent breaking changes

---

## 📋 Current Status

### ✅ Already Clean:
- No OpenAI/Manos dependencies (verified in CLEANUP_OPERATION_REPORT.md)
- Only Gemini API in use
- Clean package.json files
- No conflicting environment variables

### 🔍 Areas to Monitor:
- Documentation files (many duplicates in root)
- Old migration files
- Test files that may be outdated
- Configuration files

---

## 🎯 Workflow Rules

1. **Before Making Changes:**
   - Check for existing implementations
   - Verify no conflicts with current code
   - Review related files for consistency

2. **During Changes:**
   - Follow project patterns
   - Maintain code quality
   - Add proper error handling
   - Include necessary comments

3. **After Changes:**
   - Automatically commit and push
   - Verify no breaking changes
   - Check for linting errors
   - Ensure consistency

4. **Conflict Prevention:**
   - If unsure about a change, ask or warn
   - Block controversial implementations
   - Clean up old code proactively
   - Maintain single source of truth

---

## 🚨 Red Flags (Block These)

- Conflicting AI service implementations
- Duplicate functionality
- Old/unused code that should be removed
- Breaking architectural patterns
- Security vulnerabilities
- Performance regressions

---

**These preferences are now part of the project workflow! ✅**

