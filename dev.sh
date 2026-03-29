#!/usr/bin/env bash
# SOCAtlas - Live Development Server
# Auto-reloads as you change markdown files.
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-8087}"

cd "$ROOT_DIR"
echo "🛡️  Starting SOCAtlas Hot-Reloading Development Server..."

# Check dependencies
if ! python3 -m mkdocs --version &> /dev/null; then
    echo "📦 Installing development dependencies..."
    python3 -m pip install -r deps.txt
fi

# Release port
if command -v lsof &> /dev/null; then
    lsof -ti:"$PORT" | xargs kill -9 2>/dev/null || true
fi

echo "🌐 Development server starting at: http://127.0.0.1:$PORT"
echo "──────────────────────────────────────────"

# Run mkdocs serve using the project config
python3 -m mkdocs serve -f mkdocs.yml -a 127.0.0.1:$PORT
