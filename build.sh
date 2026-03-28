#!/usr/bin/env bash
# SOC Atlas - Production Build Script
set -e

echo "🛡️  Compiling SOC Atlas into ultra-fast static HTML..."

# Enforce dependency installation safely
python3 -m pip install --upgrade zensical

# Locate binary paths universally across MacOS / Ubuntu CI
ZENSICAL_BIN="$(python3 -c 'import site; print(site.USER_BASE)')/bin/zensical"
if [ ! -f "$ZENSICAL_BIN" ]; then
    ZENSICAL_BIN=$(which zensical || echo "zensical")
fi

# Run the build command
$ZENSICAL_BIN build -f zensical.yml

echo "✅ Compilation successful! The 'site/' folder is ready for global hosting."
