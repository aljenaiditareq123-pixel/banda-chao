#!/bin/bash
echo "🔍 Render Deployment Checker"
echo "============================"
echo ""

# Check if we can find Render service URL
echo "📋 Checking for Render configuration..."
if grep -r "onrender.com" . --include="*.md" --include="*.txt" --include="*.env*" 2>/dev/null | head -3; then
  echo "✅ Found Render references"
else
  echo "⚠️ No Render URLs found in codebase"
fi

echo ""
echo "📝 Last Commit:"
git log -1 --oneline

echo ""
echo "🌐 To check Render deployment:"
echo "   1. Go to: https://dashboard.render.com"
echo "   2. Find your backend service"
echo "   3. Check 'Events' tab for latest deployment"
echo "   4. Verify commit hash matches: $(git log -1 --format=%h)"
echo ""
echo "🔧 Required Environment Variables on Render:"
echo "   - DATABASE_URL (from Render PostgreSQL)"
echo "   - JWT_SECRET"
echo "   - FRONTEND_URL"
echo "   - NODE_ENV=production"
