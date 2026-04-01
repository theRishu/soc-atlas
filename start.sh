#!/usr/bin/env bash
# SOCAtlas - Local Production Preview Script
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-8087}"

cd "$ROOT_DIR"
echo "🛡️  Preparing SOCAtlas Production-Grade Preview..."

if command -v python3.14 &> /dev/null; then
    PYTHON_CMD="python3.14"
    PIP_ARGS="--break-system-packages"
else
    PYTHON_CMD="python3"
    PIP_ARGS=""
fi

# Ensure dependencies are present for local preview
if ! "$PYTHON_CMD" -m mkdocs --version &> /dev/null; then
    echo "📦 Installing preview dependencies..."
    "$PYTHON_CMD" -m pip install -r deps.txt $PIP_ARGS
fi

# Release port
echo "🧹 Releasing port $PORT..."
if command -v lsof &> /dev/null; then
    lsof -ti:"$PORT" | xargs kill -9 2>/dev/null || true
fi

echo "🏗️  Building site into static HTML..."
./build.sh

echo "🌐 SOCAtlas living at: http://127.0.0.1:$PORT"
echo "──────────────────────────────────────────"

# Serve the actual static output directory
cd site && "$PYTHON_CMD" -m http.server "$PORT" --bind 127.0.0.1
