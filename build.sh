#!/usr/bin/env bash
# SOCAtlas - High-Performance Build Pipe
set -e

echo "🛡️  Compiling SOCAtlas into ultra-fast HTML..."

# Enforce clean dependencies
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Detection: Find the right engine (Zensical or MkDocs)
if python3 -c "import zensical" &> /dev/null && python3 -m zensical build --help &> /dev/null; then
    echo "📦  Building with Zensical Engine..."
    python3 -m zensical build -f zensical.yml
else
    echo "🔄  Zensical binary not found. Falling back to MkDocs Material..."
    python3 -m mkdocs build -f zensical.yml -d site
fi

# FINAL SOURCE-LEVEL FLATTENER: Physically move all nested docs to the root
echo "📡 Relocating all documentation to the site root for absolute availability..."
cd site
find . -name "*.html" -mindepth 2 | while read -r file; do
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
cd ..

echo "✅ Build Complete: All documentation is now natively available at the root level."
