#!/bin/bash

# Cleanup Console Logs Script
# This script helps identify console.log statements that should be removed in production

echo "🔍 Scanning for console.log statements..."

# Count console statements
LOG_COUNT=$(grep -r "console\.log" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/ components/ server/src/ 2>/dev/null | wc -l | tr -d ' ')
ERROR_COUNT=$(grep -r "console\.error" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/ components/ server/src/ 2>/dev/null | wc -l | tr -d ' ')
WARN_COUNT=$(grep -r "console\.warn" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/ components/ server/src/ 2>/dev/null | wc -l | tr -d ' ')

echo ""
echo "📊 Console Statement Count:"
echo "  console.log:  $LOG_COUNT"
echo "  console.error: $ERROR_COUNT"
echo "  console.warn:  $WARN_COUNT"
echo ""

if [ "$LOG_COUNT" -gt 0 ]; then
  echo "⚠️  Found $LOG_COUNT console.log statements"
  echo "   Consider removing or replacing with proper logging in production"
  echo ""
  echo "   Files with console.log:"
  grep -r "console\.log" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" app/ components/ server/src/ 2>/dev/null | cut -d: -f1 | sort -u | head -10
  echo ""
fi

if [ "$ERROR_COUNT" -gt 0 ]; then
  echo "ℹ️  Found $ERROR_COUNT console.error statements"
  echo "   These are acceptable for error logging, but consider using a proper logger"
  echo ""
fi

echo "✅ Scan complete!"
echo ""
echo "💡 Recommendation:"
echo "   - Keep console.error for critical errors"
echo "   - Remove or replace console.log with a logging service"
echo "   - Use environment-based logging (only log in development)"
