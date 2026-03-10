# Instagram to Google Calendar - Next.js Quick Reference

## 🚀 One-Command Setup

```bash
# If you have pnpm installed:
pnpm install && pnpm exec playwright install chromium && pnpm dev

# If you don't have pnpm:
npm install -g pnpm && pnpm install && pnpm exec playwright install chromium && pnpm dev
```

Don't forget to add `GEMINI_API_KEY` to `.env` first!

---

## 📋 Essential Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start dev server (localhost:3000) |
| `pnpm build` | Build for production |
| `pnpm start` | Run production build |
| `pnpm type-check` | Check TypeScript |
| `pnpm lint` | Run ESLint |
| `pnpm dev -p 3001` | Use different port |

---

## 🗂️ Project Structure

```
app/
├── api/              → Next.js API routes
│   ├── convert/      → Main conversion endpoint
│   ├── health/       → Health check
│   └── test-parse/   → Testing endpoint
├── page.tsx          → Home page (React)
├── layout.tsx        → Root layout
└── globals.css       → Tailwind styles

lib/
├── services/         → Business logic
│   ├── instagram-extractor.ts
│   ├── openai-parser.ts
│   └── calendar-generator.ts
├── utils/            → Utilities
└── types/            → TypeScript types
```

---

## 🔑 Environment Variables

```env
GEMINI_API_KEY=your-key-here       # Required
PORT=3000                          # Optional (Next.js default)
```

---

## 🎯 Usage

### Web UI
1. Go to http://localhost:3000
2. Choose tab: Instagram URL or Plain Text
3. Enter content
4. Click "Convert to Calendar Event"
5. Get calendar links!

### API
```bash
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"text": "Meeting tomorrow at 2pm"}'
```

---

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Gemini AI** - AI parsing
- **Playwright** - Web scraping
- **pnpm** - Package manager

---

## 🚀 Deploy

### Vercel (1-click)
```bash
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
CMD ["pnpm", "start"]
```

---

## 📚 Documentation

- **[README.md](README.md)** - Full documentation
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide  
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Architecture details
- **[EXAMPLES.md](EXAMPLES.md)** - Code examples
- **[MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md)** - Next.js migration notes

---

## 🐛 Troubleshooting

**Port in use?**
```bash
pnpm dev -p 3001
```

**Type errors?**
```bash
pnpm type-check
```

**Clean install?**
```bash
rm -rf node_modules .next
pnpm install
```

**Playwright issues?**
```bash
pnpm exec playwright install --with-deps chromium
```

---

## ✨ Features

✅ AI-powered event extraction  
✅ Instagram URL support (posts/reels)  
✅ Natural language parsing  
✅ Multiple calendar formats  
✅ Modern React UI  
✅ Real-time validation  
✅ Mobile responsive  
✅ TypeScript throughout  

---

**Built with Next.js, TypeScript, Gemini AI, Tailwind CSS**

Need help? Check the full [README.md](README.md)
