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

# FLAT ARCHITECTURE SYMLINKER: Automatically fix all 404s by aliasing nested files to root
echo "🔗 Creating flat-link aliases for all documentation..."
cd site
find . -maxdepth 3 -name "index.html" | while read -r file; do
    dir=$(dirname "$file" | sed 's|^./||')
    if [ "$dir" != "." ]; then
        ln -sf "$dir/index.html" "${dir}.html"
    fi
done
cd ..

echo "✅ Compilation successful! The 'site/' folder is ready for global hosting."
