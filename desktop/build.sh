#!/bin/bash
set -e

# FSS License Manager — Desktop Build Script
# Usage: ./build.sh [mac|win|all]

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DESKTOP_DIR="$SCRIPT_DIR"

echo "🏗️  FSS License Manager — Desktop Build"
echo "========================================="

# Step 1: Build the frontend
echo ""
echo "📦 Step 1: Building frontend..."
cd "$PROJECT_ROOT"
npm run build
echo "✅ Frontend built successfully"

# Step 2: Copy dist to desktop
echo ""
echo "📋 Step 2: Copying dist to desktop..."
rm -rf "$DESKTOP_DIR/dist"
cp -r "$PROJECT_ROOT/dist" "$DESKTOP_DIR/dist"
echo "✅ Dist copied"

# Step 3: Install desktop dependencies (if needed)
echo ""
echo "📥 Step 3: Installing desktop dependencies..."
cd "$DESKTOP_DIR"
npm install
echo "✅ Dependencies installed"

# Step 4: Build the desktop app
TARGET="${1:-mac}"
echo ""
echo "🔨 Step 4: Building desktop app for: $TARGET"

case "$TARGET" in
  mac)
    npm run build:mac
    ;;
  win)
    npm run build:win
    ;;
  all)
    npm run build:all
    ;;
  *)
    echo "❌ Unknown target: $TARGET"
    echo "Usage: ./build.sh [mac|win|all]"
    exit 1
    ;;
esac

echo ""
echo "🎉 Build complete! Check the desktop/release/ directory."
echo ""
ls -la "$DESKTOP_DIR/release/" 2>/dev/null || echo "(Release directory will contain the installers)"
