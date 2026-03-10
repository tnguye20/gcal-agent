# 🚀 Quick Start - Gemini Edition

## Setup (One Time)

```bash
# 1. Get Gemini API key
https://aistudio.google.com/app/apikey

# 2. Add to .env
echo "GEMINI_API_KEY=your-key" > .env

# 3. Install dependencies (if needed)
pnpm install

# 4. Install Playwright (if needed)
pnpm exec playwright install chromium
```

## Run

```bash
# Start development server
pnpm dev

# Open browser
http://localhost:3000
```

## Environment Variables

```bash
GEMINI_API_KEY=your-key-here  # Required
PORT=3000                     # Optional
```

## Features

✅ **Gemini AI** - Intelligent event parsing
✅ **Instagram Support** - Paste any Instagram post/reel URL
✅ **Natural Language** - Type event details in plain English
✅ **Multiple Calendars** - Google, Outlook, Apple
✅ **Next.js 14** - Modern React framework
✅ **TypeScript** - Full type safety

## API

```bash
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"text": "Team meeting tomorrow at 2pm"}'
```

## Models Available

- `gemini-3-flash-preview` (default)
- `gemini-1.5-flash` (faster)
- `gemini-1.5-pro` (most powerful)

Change in: `lib/services/gemini-parser.ts`

## Troubleshooting

**API Key Error?**
- Check `.env` has `GEMINI_API_KEY=...`
- Restart server: `pnpm dev`

**Port in Use?**
- Try different port: `pnpm dev -p 3001`

**Type Errors?**
- Run: `pnpm type-check`

## Links

- **API Docs**: https://ai.google.dev/docs
- **Get API Key**: https://aistudio.google.com/app/apikey
- **Full README**: [README.md](README.md)

---

**Ready to convert Instagram to Calendar? Start now!** 📅✨
