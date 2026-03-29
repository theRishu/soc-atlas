#!/usr/bin/env bash
# SOCAtlas - Local Production Preview Script
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-8087}"

cd "$ROOT_DIR"
echo "🛡️  Preparing SOCAtlas Production-Grade Preview..."

# Ensure dependencies are present for local preview
if ! python3 -m mkdocs --version &> /dev/null; then
    echo "📦 Installing preview dependencies..."
    python3 -m pip install --upgrade pip
    python3 -m pip install -r deps.txt
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
cd site && python3 -m http.server "$PORT" --bind 127.0.0.1
