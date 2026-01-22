# Instagram to Google Calendar Converter

> 🎉 **Now built with Next.js 14 + pnpm!** Convert Instagram posts and text to Google Calendar invites using AI.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-8+-orange)](https://pnpm.io/)
[![Perplexity](https://img.shields.io/badge/Perplexity-Sonar-purple)](https://www.perplexity.ai/)

Convert Instagram posts, reels, and plain text into Google Calendar invite URLs using AI-powered event extraction.

---

## ⚡ Quick Start

```bash
# Use the quick start script
./start.sh

# Or manually:
pnpm install
echo "PERPLEXITY_API_KEY=pplx-your-key" > .env
pnpm dev
```

Open **http://localhost:3000** 🎉

---

## 🚀 Features

- **Instagram URL Support**: Paste any Instagram post or reel URL
- **AI-Powered Parsing**: Uses Perplexity Sonar to intelligently extract event details
- **Multiple Extraction Methods**: 
  - oEmbed API (fast, public)
  - Headless browser scraping (fallback)
- **Smart Event Detection**: Automatically detects dates, times, locations, and event titles
- **Multiple Calendar Formats**: Google Calendar, Outlook, and Apple Calendar (iCal)
- **Beautiful Web UI**: Simple, intuitive interface

## 📋 Prerequisites

- Node.js 18+
- pnpm 8+ (Install: `npm install -g pnpm`)
- Perplexity API key ([Get one here](https://www.perplexity.ai/settings/api))

## 🛠️ Installation

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Perplexity API key:
   ```
   PERPLEXITY_API_KEY=pplx-...
   PORT=3000
   ```

3. **Install Playwright browsers** (for scraping fallback):
   ```bash
   npx playwright install chromium
   ```

## 🎯 Usage

### Development Mode

```bash
pnpm dev
```

The app will start on `http://localhost:3000`

### Production Build

```bash
pnpm build
pnpm start
```

### Using the Web Interface

1. Open `http://localhost:3000` in your browser
2. Choose your input method:
   - **Instagram URL**: Paste a link to an Instagram post or reel
   - **Plain Text**: Type or paste event details
3. Click "Convert to Calendar Event"
4. The AI will extract event details and generate calendar links
5. Click on your preferred calendar service to add the event

## 🔧 API Endpoints

### POST `/api/convert`

Convert Instagram URL or text to calendar event.

**Request body**:
```json
{
  "instagramUrl": "https://www.instagram.com/p/ABC123/",
  "text": "Team meeting tomorrow at 2pm"
}
```

**Response**:
```json
{
  "success": true,
  "calendarUrl": "https://calendar.google.com/calendar/render?...",
  "eventInfo": {
    "title": "Team Meeting",
    "startDateTime": "2026-01-21T14:00:00Z",
    "endDateTime": "2026-01-21T15:00:00Z",
    "location": "Conference Room A",
    "description": "..."
  }
}
```

### GET `/api/health`

Health check endpoint.

## 📁 Project Structure

```
gcal-agent/
├── app/
│   ├── api/
│   │   ├── convert/route.ts          # Main conversion API
│   │   ├── health/route.ts           # Health check
│   │   └── test-parse/route.ts       # Test endpoint
│   ├── page.tsx                      # Home page with UI
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles
├── lib/
│   ├── services/
│   │   ├── instagram-extractor.ts    # Extract data from Instagram
│   │   ├── perplexity-parser.ts      # AI-powered event parsing
│   │   └── calendar-generator.ts     # Generate calendar URLs
│   ├── utils/
│   │   └── validators.ts             # Input validation
│   └── types/
│       └── index.ts                  # TypeScript interfaces
├── next.config.js                    # Next.js configuration
├── tailwind.config.js                # Tailwind CSS config
├── package.json
├── tsconfig.json
└── .env
```

## 🧠 How It Works

1. **User Input**: Next.js React interface for Instagram URL or text
2. **API Route**: Next.js API route handles the request
3. **Data Extraction**: Extract Instagram post data (oEmbed → Playwright fallback)
4. **AI Parsing**: Perplexity Sonar extracts event details from text
5. **Calendar Generation**: Generate URLs for Google, Outlook, Apple calendars
6. **Response**: Return event details and calendar links to the client

## 🎨 Example Use Cases

- **Event Promoters**: Convert Instagram event announcements to calendar invites
- **Content Creators**: Extract meetup/workshop details from posts
- **Personal Use**: Save events mentioned in Instagram stories/posts
- **Community Managers**: Quickly create calendar events from social posts

## ⚙️ Configuration

### Perplexity Model

Default: `sonar`

To change the model, edit [lib/services/perplexity-parser.ts](lib/services/perplexity-parser.ts):
```typescript
model: 'sonar' // or 'llama-3.1-sonar-small-128k-online' for faster
```
model: 'gpt-4-turbo' // or 'gpt-3.5-turbo' for faster/cheaper
```

### Port

Change in `.env`:
```
PORT=3000
```

Note: Next.js uses port 3000 by default. You can override with `pnpm dev -p 3001Instagram extraction fails**:
- Some posts may be private or deleted
- oEmbed API has rate limits
- Fallback scraping requires Playwright browsers installed

**Perplexity parsing errors**:
- Check API key is valid
- Ensure sufficient API credits
- Check Perplexity API status

**Date parsing issues**:
- AI makes best effort to extract dates
- Provide clear date/time formats for better results
- Current date context is provided to AI

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

---Next.js, TypeScript, Perplexity AI, Tailwind CSS

Built with ❤️ using Next.js, TypeScript, Perplexity AI, Tailwind CSS, and Playwright
