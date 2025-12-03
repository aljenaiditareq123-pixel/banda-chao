#!/bin/bash
# Quick Seed Script for Render - Shell wrapper
# This script will be available even if TypeScript files are not in dist

echo "🌱 Starting quick database seeding on Render..."
echo ""

# Navigate to server directory
cd /opt/render/project/src/server || cd ~/project/src/server || exit 1

# Check if tsx is available
if ! command -v tsx &> /dev/null; then
    echo "❌ tsx not found, installing..."
    npm install -g tsx || npx tsx --version || exit 1
fi

# Check if file exists
if [ ! -f "scripts/quick-seed.ts" ]; then
    echo "❌ File scripts/quick-seed.ts not found!"
    echo "📋 Current directory: $(pwd)"
    echo "📋 Files in scripts/:"
    ls -la scripts/ 2>/dev/null || echo "scripts/ directory not found"
    echo ""
    echo "💡 Trying alternative paths..."
    
    # Try alternative paths
    if [ -f "../server/scripts/quick-seed.ts" ]; then
        echo "✅ Found file at ../server/scripts/quick-seed.ts"
        npx tsx ../server/scripts/quick-seed.ts
    elif [ -f "../../server/scripts/quick-seed.ts" ]; then
        echo "✅ Found file at ../../server/scripts/quick-seed.ts"
        npx tsx ../../server/scripts/quick-seed.ts
    else
        echo "❌ File not found in any expected location"
        echo "📋 Searching for quick-seed.ts..."
        find . -name "quick-seed.ts" -type f 2>/dev/null | head -5
        exit 1
    fi
else
    echo "✅ File found at scripts/quick-seed.ts"
    npx tsx scripts/quick-seed.ts
fi

