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

# FLAT ARCHITECTURE ALIASER: Physically mirror all nested index.html files at the root
echo "📡 Aliasing all nested docs to the site root for global access..."
cd site
find . -maxdepth 3 -name "index.html" | while read -r file; do
    # Get the parent directory name (e.g., risk_threat_intel)
    dir=$(dirname "$file" | sed 's|^./||')
    
    # If it's a nested doc, copy it to root so Vercel sees it at /dir
    if [ "$dir" != "." ]; then
        # Create a physical file at root (e.g., /risk_threat_intel.html)
        cp "$file" "${dir}.html"
        
        # Also create a directory and copy to ensure /risk_threat_intel/ works
        mkdir -p "$dir"
        cp "$file" "$dir/index.html"
    fi
done
cd ..

echo "✅ Compilation successful! All paths are now globally accessible."
