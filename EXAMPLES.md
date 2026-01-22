# Usage Examples

## 📝 Real-World Examples

### Example 1: Instagram Event Post

**Input (Instagram URL)**:
```
https://www.instagram.com/p/ABC123xyz/
```

**Instagram Caption**:
```
🎉 Product Launch Party! 
Join us this Friday, January 24th at 7 PM
Location: Tech Hub Downtown, 123 Main Street
Food, drinks, and demos!
```

**AI Extracts**:
- **Title**: Product Launch Party
- **Date**: 2026-01-24
- **Time**: 19:00 - 20:00 (assumes 1 hour)
- **Location**: Tech Hub Downtown, 123 Main Street
- **Description**: Join us for food, drinks, and demos at our product launch!

**Output**: Google Calendar URL ready to add event

---

### Example 2: Plain Text Meeting

**Input (Text)**:
```
Team standup tomorrow at 10am in Conference Room B. 
Discussing Q1 roadmap and sprint planning.
```

**AI Extracts**:
- **Title**: Team Standup
- **Date**: 2026-01-21 (tomorrow from current date)
- **Time**: 10:00 - 11:00
- **Location**: Conference Room B
- **Description**: Discussing Q1 roadmap and sprint planning

---

### Example 3: Natural Language

**Input (Text)**:
```
Coffee with Sarah next Tuesday at 3pm at Starbucks downtown
```

**AI Extracts**:
- **Title**: Coffee with Sarah
- **Date**: 2026-01-28 (next Tuesday)
- **Time**: 15:00 - 16:00
- **Location**: Starbucks downtown
- **Description**: Coffee meeting

---

### Example 4: Workshop/Class

**Input (Text)**:
```
Python workshop on February 15th from 3pm to 5pm. 
Virtual event via Zoom. Link will be sent before the session.
```

**AI Extracts**:
- **Title**: Python Workshop
- **Date**: 2026-02-15
- **Time**: 15:00 - 17:00 (explicit end time)
- **Location**: Virtual event via Zoom
- **Description**: Link will be sent before the session

---

## 🎯 Use Cases

### For Event Organizers
```javascript
// Copy Instagram post URL → Paste → Generate calendar link
// Share calendar link with attendees
// Attendees can add to their calendar in one click
```

### For Content Creators
```javascript
// Extract event from Instagram story/post
// Add to personal calendar
// Set reminders automatically
```

### For Teams
```javascript
// Paste meeting details from any text
// AI structures the information
// Share calendar invite with team
```

---

## 💻 API Usage Examples

### cURL Example

```bash
# Convert Instagram URL
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "instagramUrl": "https://www.instagram.com/p/ABC123xyz/"
  }'

# Convert plain text
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Team meeting tomorrow at 2pm in Conference Room A"
  }'
```

### JavaScript/Fetch Example

```javascript
async function convertToCalendar(instagramUrl) {
  const response = await fetch('http://localhost:3000/api/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ instagramUrl }),
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Event:', data.eventInfo.title);
    console.log('Calendar URL:', data.calendarUrl);
    
    // Redirect user to calendar
    window.open(data.calendarUrl, '_blank');
  } else {
    console.error('Error:', data.error);
  }
}

// Usage
convertToCalendar('https://www.instagram.com/p/ABC123xyz/');
```

### Python Example

```python
import requests
import json

def convert_to_calendar(text):
    url = 'http://localhost:3000/api/convert'
    payload = {'text': text}
    
    response = requests.post(url, json=payload)
    data = response.json()
    
    if data['success']:
        print(f"Title: {data['eventInfo']['title']}")
        print(f"Start: {data['eventInfo']['startDateTime']}")
        print(f"Calendar URL: {data['calendarUrl']}")
        return data['calendarUrl']
    else:
        print(f"Error: {data['error']}")
        return None

# Usage
calendar_url = convert_to_calendar(
    "Workshop on machine learning next Friday at 2pm"
)
```

### Node.js Example

```javascript
const axios = require('axios');

async function convertToCalendar(instagramUrl) {
  try {
    const response = await axios.post('http://localhost:3000/api/convert', {
      instagramUrl,
    });

    const { eventInfo, calendarUrl } = response.data;
    
    console.log('✅ Event created:');
    console.log(`   Title: ${eventInfo.title}`);
    console.log(`   Start: ${eventInfo.startDateTime}`);
    console.log(`   Location: ${eventInfo.location || 'N/A'}`);
    console.log(`   Google Calendar: ${calendarUrl}`);
    
    return calendarUrl;
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error || error.message);
  }
}

// Usage
convertToCalendar('https://www.instagram.com/p/ABC123xyz/');
```

---

## 🎨 Advanced Examples

### Example: Multiple Events Batch Processing

```javascript
const events = [
  { text: 'Team meeting Monday at 10am' },
  { text: 'Lunch with client Wednesday at noon' },
  { text: 'Workshop Friday 2-4pm' },
];

async function batchConvert(events) {
  const results = await Promise.all(
    events.map(event => 
      fetch('http://localhost:3000/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).then(r => r.json())
    )
  );
  
  results.forEach((result, i) => {
    if (result.success) {
      console.log(`✅ Event ${i + 1}: ${result.eventInfo.title}`);
    } else {
      console.log(`❌ Event ${i + 1} failed: ${result.error}`);
    }
  });
}

batchConvert(events);
```

### Example: Browser Extension Integration

```javascript
// content.js - Browser extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'convertInstagram') {
    const instagramUrl = window.location.href;
    
    fetch('http://localhost:3000/api/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instagramUrl }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          // Open calendar in new tab
          chrome.tabs.create({ url: data.calendarUrl });
        }
      });
  }
});
```

### Example: Slack Bot Integration

```javascript
// Slack bot command: /calendar [instagram url or text]
app.command('/calendar', async ({ command, ack, say }) => {
  await ack();
  
  const input = command.text;
  const isInstagramUrl = input.includes('instagram.com');
  
  const response = await fetch('http://localhost:3000/api/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      isInstagramUrl ? { instagramUrl: input } : { text: input }
    ),
  });
  
  const data = await response.json();
  
  if (data.success) {
    await say({
      text: `📅 Event: ${data.eventInfo.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${data.eventInfo.title}*\n📅 ${data.eventInfo.startDateTime}\n📍 ${data.eventInfo.location || 'N/A'}`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Add to Google Calendar' },
              url: data.calendarUrl,
            },
          ],
        },
      ],
    });
  }
});
```

---

## 🧪 Testing Examples

### Test with Different Date Formats

```javascript
const testCases = [
  'Meeting tomorrow at 3pm',
  'Party on Jan 25th at 8 PM',
  'Workshop next Monday from 2-4pm',
  'Call at 10:30am on 2026-02-01',
  'Dinner this Friday evening at 7',
];

testCases.forEach(async (text) => {
  const response = await fetch('http://localhost:3000/api/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  
  const data = await response.json();
  console.log(`Input: "${text}"`);
  console.log(`Parsed Date: ${data.eventInfo?.startDateTime}\n`);
});
```

### Test Error Handling

```javascript
// Test invalid Instagram URL
await fetch('http://localhost:3000/api/convert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ instagramUrl: 'not-a-valid-url' }),
});
// Expected: 400 error with validation message

// Test missing input
await fetch('http://localhost:3000/api/convert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({}),
});
// Expected: 400 error - "At least one of instagramUrl, text, or imageUrl must be provided"
```

---

## 📊 Response Format

### Successful Response

```json
{
  "success": true,
  "calendarUrl": "https://calendar.google.com/calendar/render?action=TEMPLATE&text=...",
  "eventInfo": {
    "title": "Team Meeting",
    "startDateTime": "2026-01-21T14:00:00.000Z",
    "endDateTime": "2026-01-21T15:00:00.000Z",
    "location": "Conference Room A",
    "description": "Discussing Q1 roadmap and sprint planning",
    "googleUrl": "https://calendar.google.com/...",
    "outlookUrl": "https://outlook.live.com/...",
    "appleUrl": "data:text/calendar;charset=utf8,..."
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Invalid Instagram URL"
}
```

---

## 🎓 Tips for Best Results

### Writing Event Text
✅ **Good**:
- "Workshop on February 15th from 3pm to 5pm at Tech Hub"
- "Team lunch tomorrow at noon in downtown"
- "Conference call next Tuesday at 10:30am"

❌ **Less Optimal**:
- "Workshop sometime next month" (too vague)
- "Meeting soon" (no specific date/time)
- "Event" (no context)

### Instagram Posts
- Make sure dates/times are in the caption
- Include location information
- Use clear event titles
- Post must be public (or accessible)

---

Ready to use? Check out [QUICKSTART.md](QUICKSTART.md) to get started!
