#!/bin/bash

# VINTEE Image Optimization Script
# Applies vintage color grading and optimizes for web

echo "🎨 VINTEE Image Optimization"
echo "=============================="
echo ""

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick not found. Installing via Homebrew..."
    brew install imagemagick
fi

# VINTEE Color Grading Settings
BRIGHTNESS="+5"
CONTRAST="-5"
SATURATION="-10"
WARMTH="+10"
GRAIN="3"

# Hero Images
echo "📸 Processing Hero Images..."
for i in {1..3}; do
    INPUT="public/images/hero/hero-$i.jpg"
    OUTPUT="public/images/hero/hero-$i-optimized.jpg"

    if [ -f "$INPUT" ]; then
        echo "  Processing hero-$i.jpg..."

        # Apply VINTEE preset
        convert "$INPUT" \
            -modulate 105,90,100 \
            -brightness-contrast $BRIGHTNESS,$CONTRAST \
            +noise Gaussian \
            -attenuate 0.3 \
            -quality 85 \
            -strip \
            "$OUTPUT"

        # Replace original
        mv "$OUTPUT" "$INPUT"
        echo "  ✓ hero-$i.jpg optimized"
    fi
done

# Property Images
echo ""
echo "🏡 Processing Property Images..."
for i in {1..5}; do
    INPUT="public/images/properties/property-$i.jpg"
    OUTPUT="public/images/properties/property-$i-optimized.jpg"

    if [ -f "$INPUT" ]; then
        echo "  Processing property-$i.jpg..."

        # Apply VINTEE preset
        convert "$INPUT" \
            -modulate 105,90,100 \
            -brightness-contrast $BRIGHTNESS,$CONTRAST \
            +noise Gaussian \
            -attenuate 0.3 \
            -quality 85 \
            -strip \
            "$OUTPUT"

        # Replace original
        mv "$OUTPUT" "$INPUT"
        echo "  ✓ property-$i.jpg optimized"
    fi
done

echo ""
echo "✨ Optimization complete!"
echo ""
echo "Image Statistics:"
du -sh public/images/hero/
du -sh public/images/properties/
