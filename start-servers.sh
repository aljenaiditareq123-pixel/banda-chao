#!/bin/bash
echo "🚀 Starting Banda Chao Servers..."
echo ""

# Kill existing processes
echo "1. Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 2

# Start backend
echo "2. Starting Backend Server (port 3001)..."
cd server
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
sleep 5

# Check if backend started
if curl -s http://localhost:3001/api/v1/ops/health > /dev/null 2>&1; then
  echo "   ✅ Backend is responding"
else
  echo "   ⚠️  Backend may still be starting..."
fi

# Start frontend
echo "3. Starting Frontend Server (port 3000)..."
cd ..
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"
sleep 5

# Check if frontend started
if curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "   ✅ Frontend is responding"
else
  echo "   ⚠️  Frontend may still be starting..."
fi

echo ""
echo "✅ Servers starting..."
echo "📋 Backend logs: tail -f backend.log"
echo "📋 Frontend logs: tail -f frontend.log"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"
