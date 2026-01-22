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
    echo "⚙️  Please edit .env and add your Perplexity API key:"
    echo "   PERPLEXITY_API_KEY=pplx-..."
    echo ""
else
    echo "✅ .env file exists"
fi

# Check if PERPLEXITY_API_KEY is set
if grep -q "PERPLEXITY_API_KEY=$" .env || grep -q "PERPLEXITY_API_KEY=your_perplexity_api_key_here" .env; then
    echo "⚠️  WARNING: Perplexity API key not set in .env"
    echo "   Get your API key from: https://www.perplexity.ai/settings/api"
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
echo "   1. Add your OpenAI API key to .env file"
echo "   2. Run: pnpm dev"
echo "   3. Open: http://localhost:3000"
echo ""
