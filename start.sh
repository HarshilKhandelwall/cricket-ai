#!/bin/bash
# CricketIQ Quick Start Script
# Usage: ./start.sh YOUR_GEMINI_API_KEY

echo "🏏 Starting CricketIQ..."

if [ -n "$1" ]; then
  export GEMINI_API_KEY="$1"
  echo "✅ API key set"
else
  echo "⚠️  No API key provided — demo mode will be used"
  echo "   Usage: ./start.sh YOUR_GEMINI_API_KEY"
fi

# Start backend
echo "🚀 Starting backend on :5001..."
cd backend
pip install -r requirements.txt -q
python app.py &
BACKEND_PID=$!

cd ../frontend
echo "🎨 Starting frontend on :5173..."
npm install --silent
npm run dev &
FRONTEND_PID=$!

echo ""
echo "═══════════════════════════════════════"
echo "  CricketIQ is running!"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:5001"
echo "  Press Ctrl+C to stop"
echo "═══════════════════════════════════════"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
