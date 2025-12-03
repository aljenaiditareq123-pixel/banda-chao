#!/bin/bash
# Complete Seed Script for Render Shell
# Run: bash scripts/render-seed.sh

set -e  # Exit on error

echo "🌱 Starting database seeding on Render..."
echo ""

# Navigate to server directory
cd "$(dirname "$0")/.." || exit 1
pwd

# Check if tsx is available
if ! command -v tsx &> /dev/null && ! command -v npx &> /dev/null; then
    echo "❌ Error: tsx or npx not found"
    exit 1
fi

# Run the seed script
echo "📦 Running seed script..."
if command -v tsx &> /dev/null; then
    tsx scripts/quick-seed.ts
elif command -v npx &> /dev/null; then
    npx tsx scripts/quick-seed.ts
else
    echo "❌ Error: Cannot find tsx or npx"
    exit 1
fi

echo ""
echo "✅ Seeding completed!"

