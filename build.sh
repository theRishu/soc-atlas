#!/usr/bin/env bash
# SOCAtlas - Production build script
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SITE_DIR="$ROOT_DIR/site"
PUBLIC_DIR="$ROOT_DIR/public"

cd "$ROOT_DIR"

echo "🛡️  Compiling SOCAtlas into ultra-fast HTML..."

if ! python3 -m mkdocs --version &> /dev/null; then
    echo "📦 Installing build dependencies..."
    python3 -m pip install --upgrade pip
    python3 -m pip install -r deps.txt
fi

echo "📚 Generating complete guide export..."
python3 scripts/generate_complete_guide.py

echo "🏗️  Building with MkDocs Material..."
python3 -m mkdocs build -f mkdocs.yml -d "$SITE_DIR"

# FINAL SOURCE-LEVEL FLATTENER: Physically move all nested docs to the root
echo "📡 Relocating all documentation to the site root for absolute availability..."
cd "$SITE_DIR"
find . -mindepth 2 -name "*.html" -print0 | while IFS= read -r -d '' file; do
    filename=$(basename "$file")

    # If it's a documentation file (not index.html), move it to root
    if [ "$filename" != "index.html" ]; then
        cp -f "$file" "$filename"
    else
        # If it is an index.html, use the directory name as the root file name
        dir_name=$(dirname "$file" | sed 's|^\./||; s|/|_|g')
        cp -f "$file" "${dir_name}.html"
    fi
done
cd "$ROOT_DIR"

echo "📦 Syncing static output to public/ for Vercel..."
mkdir -p "$PUBLIC_DIR"
if command -v rsync &> /dev/null; then
    rsync -a --delete "$SITE_DIR"/ "$PUBLIC_DIR"/
else
    cp -R "$SITE_DIR"/. "$PUBLIC_DIR"/
fi

echo "🚫 Writing Vercel skip config for gh-pages exports..."
cat > "$SITE_DIR/vercel.json" <<'EOF'
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "buildCommand": "",
  "installCommand": "",
  "ignoreCommand": "echo \"Skipping Vercel deploy for gh-pages\"; exit 0"
}
EOF

echo "✅ Build Complete."
