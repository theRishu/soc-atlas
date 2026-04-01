#!/usr/bin/env bash
# SOCAtlas - Live Development Server
# Auto-reloads as you change markdown files.
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-8087}"

cd "$ROOT_DIR"
echo "🛡️  Starting SOCAtlas Hot-Reloading Development Server..."

if command -v python3.14 &> /dev/null; then
    PYTHON_CMD="python3.14"
    PIP_ARGS="--break-system-packages"
else
    PYTHON_CMD="python3"
    PIP_ARGS=""
fi

if ! "$PYTHON_CMD" -m mkdocs --version &> /dev/null; then
    echo "📦 Installing development dependencies..."
    "$PYTHON_CMD" -m pip install -r deps.txt $PIP_ARGS
fi

echo "📚 Generating complete guide export..."
"$PYTHON_CMD" scripts/generate_complete_guide.py

# Release port
if command -v lsof &> /dev/null; then
    lsof -ti:"$PORT" | xargs kill -9 2>/dev/null || true
fi

echo "🌐 Development server starting at: http://127.0.0.1:$PORT"
echo "──────────────────────────────────────────"

# Run mkdocs serve using the project config
"$PYTHON_CMD" -m mkdocs serve -f mkdocs.yml -a 127.0.0.1:$PORT
