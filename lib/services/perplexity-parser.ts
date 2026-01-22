import OpenAI from 'openai';
import { ParsedEventInfo } from '../types';

export class PerplexityParser {
  private client: OpenAI;

  constructor(apiKey: string) {
    // Perplexity API is OpenAI-compatible
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.perplexity.ai',
    });
  }

  /**
   * Parse text using Perplexity to extract calendar event information
   */
  async parseEventInfo(text: string, context?: string): Promise<ParsedEventInfo> {
    const currentDate = new Date().toISOString();
    
    const systemPrompt = `You are an expert at extracting event information from social media posts and text. 
Extract calendar event details from the provided text.

Current date/time for reference: ${currentDate}

IMPORTANT: Return ONLY a valid JSON object. Do not wrap it in markdown code blocks or backticks.

Return a JSON object with:
- title: Event name/title (required)
- startDateTime: ISO 8601 format (required)
- endDateTime: ISO 8601 format (required, default to 1 hour after start if not specified)
- location: Physical or virtual location (optional)
- description: Brief description (optional)

Rules:
1. If no explicit date/time found, infer from context or use "suggested" dates
2. For relative dates like "tomorrow", "next week", calculate from current date
3. If only date given (no time), default to 10:00 AM
4. If no end time given, default to 1 hour after start
5. Be intelligent about inferring event type from context
6. Extract location mentions (addresses, venue names, "virtual", "zoom", etc.)

Return ONLY the JSON object, no additional text or formatting.`;

    const userPrompt = context 
      ? `Instagram Post Context: ${context}\n\nText to parse: ${text}`
      : `Text to parse: ${text}`;

    let content: string | null = null;

    try {
      const response = await this.client.chat.completions.create({
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      });

      content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from Perplexity');
      }

      // Extract JSON from markdown code blocks if present
      let jsonString = content.trim();
      
      // Remove markdown code fences (```json ... ``` or ``` ... ```)
      const codeBlockMatch = jsonString.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1].trim();
      }
      
      // Remove any leading/trailing backticks or whitespace
      jsonString = jsonString.replace(/^`+|`+$/g, '').trim();

      const parsed = JSON.parse(jsonString) as ParsedEventInfo;

      // Validate required fields
      if (!parsed.title || !parsed.startDateTime || !parsed.endDateTime) {
        throw new Error('Missing required event information');
      }

      // Validate dates
      const start = new Date(parsed.startDateTime);
      const end = new Date(parsed.endDateTime);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date format');
      }

      if (end <= start) {
        // Fix end time if it's before start
        end.setHours(start.getHours() + 1);
        parsed.endDateTime = end.toISOString();
      }

      return parsed;
    } catch (error) {
      console.error('Perplexity parsing error:', error);
      console.error('Raw content received:', content);
      
      // Provide more helpful error message
      if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse JSON response from Perplexity. The AI returned invalid JSON format.`);
      }
      
      throw new Error(`Failed to parse event info: ${error}`);
    }
  }

  /**
   * Enhance event description with AI
   */
  async enhanceDescription(originalText: string, eventInfo: ParsedEventInfo): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'Create a concise, professional calendar event description from the given text. Keep it under 200 characters.',
          },
          {
            role: 'user',
            content: `Event: ${eventInfo.title}\nOriginal text: ${originalText}`,
          },
        ],
        max_tokens: 100,
        temperature: 0.5,
      });

      return response.choices[0].message.content || originalText;
    } catch (error) {
      return originalText;
    }
  }
}
