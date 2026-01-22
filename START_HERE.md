# 🚀 Quick Start - Perplexity Edition

## Setup (One Time)

```bash
# 1. Get Perplexity API key
https://www.perplexity.ai/settings/api

# 2. Add to .env
echo "PERPLEXITY_API_KEY=pplx-your-key" > .env

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
PERPLEXITY_API_KEY=pplx-your-key-here  # Required
PORT=3000                               # Optional
```

## Features

✅ **Perplexity Sonar AI** - Intelligent event parsing with online access
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

- `sonar` (default)
- `llama-3.1-sonar-small-128k-online` (faster)
- `llama-3.1-sonar-huge-128k-online` (most powerful)

Change in: `lib/services/perplexity-parser.ts`

## Troubleshooting

**API Key Error?**
- Check `.env` has `PERPLEXITY_API_KEY=pplx-...`
- Restart server: `pnpm dev`

**Port in Use?**
- Try different port: `pnpm dev -p 3001`

**Type Errors?**
- Run: `pnpm type-check`

## Links

- **API Docs**: https://docs.perplexity.ai/
- **Get API Key**: https://www.perplexity.ai/settings/api
- **Full README**: [README.md](README.md)
- **Migration Guide**: [PERPLEXITY_MIGRATION.md](PERPLEXITY_MIGRATION.md)

---

**Ready to convert Instagram to Calendar? Start now!** 📅✨
