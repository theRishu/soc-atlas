#!/usr/bin/env bash
# SOCAtlas - Local Production Preview Script
set -e

PORT=8087
echo "🛡️  Preparing SOCAtlas Production-Grade Preview..."

# Locate build engine or fallback
if ! command -v zensical &> /dev/null && ! python3 -m mkdocs --version &> /dev/null; then
    echo "📦 Installing build engine..."
    python3 -m pip install --upgrade pip
    python3 -m pip install -r requirements.txt
fi

# Release port
echo "🧹 Releasing port $PORT..."
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true

# Perform a quick fresh build
echo "🏗️  Building site into static HTML..."
if python3 -m zensical build -f zensical.yml &> /dev/null; then
    echo "✅ Zensical build complete."
else
    python3 -m mkdocs build -f zensical.yml -d site
    echo "✅ MkDocs build complete."
fi

echo "🌐 SOCAtlas living at: http://127.0.0.1:$PORT"
echo "──────────────────────────────────────────"

# Serve the actual static output directory
cd site && python3 -m http.server $PORT --bind 127.0.0.1
