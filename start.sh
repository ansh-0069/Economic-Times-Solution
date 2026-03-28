#!/bin/bash
set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║       FinMentor AI — Starting        ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Check .env
if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠  Created .env — add your ANTHROPIC_API_KEY then re-run"
  exit 1
fi

if grep -q "your_key_here" .env; then
  echo "⚠  Add your ANTHROPIC_API_KEY to .env first"
  exit 1
fi

# Install backend deps if needed
if ! python -c "import fastapi" 2>/dev/null; then
  echo "Installing backend dependencies..."
  pip install -r requirements.txt -q
fi

# Start backend
echo "Starting backend on http://localhost:8000 ..."
uvicorn backend.main:app --reload --port 8000 &
BACKEND_PID=$!
sleep 2

# Install frontend deps if needed
if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend dependencies (first time, ~2 min)..."
  cd frontend && npm install --silent && cd ..
fi

# Start frontend
echo "Starting frontend on http://localhost:3000 ..."
cd frontend && npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✓ FinMentor AI is running!"
echo "  App:    http://localhost:3000"
echo "  API:    http://localhost:8000"
echo "  Docs:   http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"

trap "echo ''; echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT
wait
