#!/bin/bash
echo "🔍 Backend Server Diagnostic"
echo "=============================="
echo ""
echo "1. Checking if backend is running on port 3001..."
if lsof -ti:3001 > /dev/null 2>&1; then
  echo "   ✅ Backend is running (PID: $(lsof -ti:3001))"
else
  echo "   ❌ Backend is NOT running"
fi
echo ""
echo "2. Testing API endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/v1/ops/health 2>&1)
if [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "200" ]; then
  echo "   ✅ API is responding (HTTP $RESPONSE - needs auth)"
else
  echo "   ❌ API not responding (HTTP $RESPONSE)"
fi
echo ""
echo "3. Checking NEXT_PUBLIC_API_URL..."
if [ -f .env.local ]; then
  if grep -q "NEXT_PUBLIC_API_URL" .env.local; then
    echo "   ✅ Found in .env.local:"
    grep "NEXT_PUBLIC_API_URL" .env.local
  else
    echo "   ⚠️  NOT found in .env.local"
  fi
else
  echo "   ⚠️  .env.local file not found"
fi
