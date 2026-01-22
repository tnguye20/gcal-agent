# Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Web App (public/index.html)                                │ │
│  │  - Instagram URL input                                      │ │
│  │  - Plain text input                                         │ │
│  │  - Calendar links output                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP POST /api/convert
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Express API Server                           │
│                        (src/index.ts)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
┌──────────────────┐ ┌─────────────────┐ ┌──────────────────┐
│  Instagram       │ │  OpenAI         │ │  Calendar        │
│  Extractor       │ │  Parser         │ │  Generator       │
│                  │ │                 │ │                  │
│  - oEmbed API    │ │  - GPT-4        │ │  - Google Cal    │
│  - Playwright    │ │  - Event parse  │ │  - Outlook       │
│  - Scraping      │ │  - Date extract │ │  - Apple iCal    │
└──────────────────┘ └─────────────────┘ └──────────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                           │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────────────────┐ │
│  │  Instagram   │  │  OpenAI     │  │  Browser (Playwright)  │ │
│  │  API/Website │  │  API        │  │  for Scraping          │ │
│  └──────────────┘  └─────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### 1. Input Processing
```
User Input (Instagram URL or Text)
    ↓
Validation (validators.ts)
    ↓
Extract Instagram Post Data (if URL provided)
    ├─ Try oEmbed API (fast, public)
    └─ Fallback to Playwright scraping
```

### 2. AI Parsing
```
Extracted Text + Context
    ↓
OpenAI GPT-4 API
    ↓
Structured Event Data
    ├─ Title
    ├─ Start Date/Time (ISO 8601)
    ├─ End Date/Time (ISO 8601)
    ├─ Location
    └─ Description
```

### 3. Calendar Generation
```
Structured Event Data
    ↓
Calendar Generator
    ├─ Google Calendar URL
    ├─ Outlook Calendar URL
    └─ Apple iCal File
    ↓
Return to User
```

## 📦 Module Breakdown

### Services Layer

#### `instagram-extractor.ts`
**Purpose**: Extract data from Instagram URLs
- **Methods**:
  - `extractFromUrl()` - Main extraction method
  - `extractViaOEmbed()` - Fast public API
  - `extractViaScraping()` - Playwright fallback
  - `extractFromText()` - Plain text handling
- **Returns**: InstagramPost object with caption, timestamp, location, thumbnail

#### `openai-parser.ts`
**Purpose**: AI-powered event information extraction
- **Methods**:
  - `parseEventInfo()` - Extract event details using GPT-4
  - `enhanceDescription()` - Polish event descriptions
- **Features**:
  - Natural language date parsing
  - Context-aware extraction
  - Intelligent defaults (e.g., 1-hour duration)
- **Returns**: ParsedEventInfo with structured data

#### `calendar-generator.ts`
**Purpose**: Generate calendar URLs for multiple services
- **Methods**:
  - `generateGoogleCalendarUrl()` - Primary method
  - `generateMultipleUrls()` - All formats
  - `generateOutlookUrl()` - Outlook/Office365
  - `generateICalFile()` - Apple Calendar
- **Returns**: Calendar URLs in various formats

### Utilities

#### `validators.ts`
- Input validation using Zod schemas
- Instagram URL validation
- URL normalization

### Types

#### `types/index.ts`
- TypeScript interfaces
- Type safety across application
- Request/response contracts

## 🎯 Key Design Decisions

### 1. **Dual Extraction Strategy**
- **oEmbed First**: Fast, reliable for public posts
- **Scraping Fallback**: Handles edge cases with Playwright
- **Benefit**: High success rate with optimal performance

### 2. **AI-Powered Parsing**
- **OpenAI GPT-4**: Understands natural language
- **Context Injection**: Provides current date/time
- **Structured Output**: JSON mode for reliability
- **Benefit**: Handles ambiguous/creative event descriptions

### 3. **Multi-Calendar Support**
- **Google Calendar**: URL-based, instant
- **Outlook**: URL-based for Office365
- **Apple**: iCal file download
- **Benefit**: Works with user's preferred calendar

### 4. **TypeScript Throughout**
- **Type Safety**: Catch errors at compile time
- **IntelliSense**: Better developer experience
- **Maintainability**: Self-documenting code

## 🔒 Security Considerations

- ✅ Input validation with Zod
- ✅ URL normalization prevents injection
- ✅ API key stored in environment variables
- ✅ CORS enabled for web interface
- ✅ No credentials stored or logged

## 🚀 Performance Optimizations

- **Fast Path**: oEmbed API (~200ms)
- **Fallback Path**: Scraping (~2-3 seconds)
- **AI Processing**: GPT-4 Turbo (~1-2 seconds)
- **Total**: 1-5 seconds typical response time

## 📈 Scalability

### Current Architecture
- Single Express server
- Synchronous processing
- Suitable for: Personal use, small teams

### Future Enhancements
- Add Redis caching for Instagram posts
- Queue system for batch processing
- Rate limiting for public API
- Database for analytics/history
- WebSocket for real-time updates

## 🧪 Testing Strategy

### Manual Testing
- `test-api.js` - Quick API verification
- Web UI - End-to-end testing
- Multiple Instagram URLs
- Various text formats

### Future Testing
- Unit tests for each service
- Integration tests for API endpoints
- E2E tests with Playwright
- Load testing for scalability

## 📊 Error Handling

```
Request → Validation → Processing → Response
   ↓          ↓            ↓           ↓
 400       400          500        200/500
Invalid  Invalid     Server      Success
Input   Instagram    Error       or Error
```

### Error Types
1. **Validation Errors** (400): Invalid input format
2. **Extraction Errors** (500): Instagram scraping failed
3. **AI Errors** (500): OpenAI API issues
4. **Network Errors** (500): External service timeout

## 🎨 UI/UX Design

### Principles
- **Simplicity**: Single-page, focused interface
- **Speed**: Instant feedback, loading states
- **Clarity**: Clear error messages
- **Accessibility**: Semantic HTML, keyboard navigation

### User Flow
1. Choose input type (tabs)
2. Paste content
3. Click convert
4. See parsed event details
5. Click preferred calendar service
6. Event added to calendar

---

## 🔮 Future Enhancements

### Phase 2 Features
- [ ] Image OCR support (extract text from images)
- [ ] Browser extension
- [ ] Batch processing (multiple URLs)
- [ ] Event history/library
- [ ] Custom event templates
- [ ] Email integration

### Phase 3 Features
- [ ] Multi-language support
- [ ] Other social platforms (Twitter, Facebook, TikTok)
- [ ] Recurring event detection
- [ ] Smart suggestions based on history
- [ ] Mobile app

---

Built with TypeScript, Express, OpenAI GPT-4, and Playwright
