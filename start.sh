#!/bin/bash

# Quick start script for gcal-agent

echo "🚀 Starting Instagram to Google Calendar Converter..."
echo ""

# Check if .env exists and has API key
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found"
    echo "Please create .env file with:"
    echo "  PERPLEXITY_API_KEY=pplx-your-key-here"
    echo ""
    echo "Run: cp .env.example .env"
    exit 1
fi

if grep -q "PERPLEXITY_API_KEY=$" .env || grep -q "PERPLEXITY_API_KEY=your_perplexity_api_key_here" .env; then
    echo "⚠️  WARNING: Perplexity API key not set in .env"
    echo "Please edit .env and add your API key"
    echo "Get one here: https://www.perplexity.ai/settings/api"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm not found. Installing..."
    npm install -g pnpm
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

echo ""
echo "✅ Starting development server..."
echo "   Open http://localhost:3000 in your browser"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

pnpm dev
