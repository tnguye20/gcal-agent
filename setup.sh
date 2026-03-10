#!/bin/bash

# Setup script for gcal-agent (Next.js)

echo "🚀 Setting up Instagram to Google Calendar Converter (Next.js)..."
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm not found. Installing pnpm globally..."
    npm install -g pnpm
    echo "✅ pnpm installed"
    echo ""
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env created"
    echo ""
    echo "⚙️  Please edit .env and add your Gemini API key:"
    echo "   GEMINI_API_KEY=your-key-here"
    echo ""
else
    echo "✅ .env file exists"
fi

# Check if GEMINI_API_KEY is set
if grep -q "GEMINI_API_KEY=$" .env || grep -q "GEMINI_API_KEY=your_gemini_api_key_here" .env; then
    echo "⚠️  WARNING: Gemini API key not set in .env"
    echo "   Get your API key from: https://aistudio.google.com/app/apikey"
    echo ""
fi

echo "📦 Installing dependencies with pnpm..."
pnpm install

echo ""
echo "🌐 Installing Playwright browsers..."
pnpm exec playwright install chromium

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Add your Gemini API key to .env file"
echo "   2. Run: pnpm dev"
echo "   3. Open: http://localhost:3000"
echo ""
