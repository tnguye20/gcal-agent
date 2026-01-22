# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Set Your Perplexity API Key

Edit the `.env` file and add your Perplexity API key:

```bash
PERPLEXITY_API_KEY=pplx-...your-key-here
PORT=3000
```

Get your API key from: https://www.perplexity.ai/settings/api

### 2. Install Dependencies & Start the Server

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

### 3. Open the Web App

Open your browser to: http://localhost:3000

---

## 🎯 Usage Examples

### Instagram URL
Paste any Instagram post or reel URL:
```
https://www.instagram.com/p/ABC123xyz/
https://www.instagram.com/reel/DEF456uvw/
```

### Plain Text
Type or paste event details:
```
Team meeting tomorrow at 2pm in Conference Room A
Coffee with John next Friday at 10am at Starbucks
Workshop on February 15th from 3pm to 5pm, virtual event
```

---

## 📝 API Usage

### Test with curl

```bash
# Test with plain text
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"text": "Team meeting tomorrow at 2pm"}'

# Test with Instagram URL
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"instagramUrl": "https://www.instagram.com/p/ABC123/"}'
```

### Test with Node.js

Run the included test script:
```bash
node test-api.js
```

---

## 🎨 Features

✅ Built with Next.js 14 (App Router)
✅ AI-powered event extraction with Perplexity Sonar
✅ Instagram post/reel scraping (oEmbed + Playwright fallback)
✅ Natural language date/time parsing
✅ Multiple calendar formats (Google, Outlook, Apple)
✅ Beautiful React UI with Tailwind CSS
✅ RESTful API with Next.js API routes
✅ Full TypeScript support

---

## 🔍 Troubleshooting

**"Perplexity API key not found"**
- Make sure `.env` file exists and contains your API key
- Restart the server after adding the key

**Instagram extraction fails**
- Some posts may be private or deleted
- Try the plain text option instead
- Check if you need to install Playwright: `npx playwright install chromium`

**Server won't start**pnpm install`
- Try a different port: `pnpm dev -p 3001
- Make sure port 3000 is not in use
- Check that all dependencies are installed: `npm install`

---

## 📞 Need Help?

Check the full [README.md](README.md) for detailed documentation.
