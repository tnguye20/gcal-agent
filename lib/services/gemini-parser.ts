import { GoogleGenerativeAI } from '@google/generative-ai';
import { ParsedEventInfo } from '../types';

export class GeminiParser {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Parse event from image using Gemini Vision
   */
  async parseEventFromImage(imageBase64: string): Promise<ParsedEventInfo> {
    const currentDate = new Date().toISOString();
    
    // Use gemini-pro-vision model which supports vision tasks
    const model = this.genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = `You are an expert at extracting event information from images.
Extract calendar event details from the provided image.

Current date/time for reference: ${currentDate}

Return a JSON object with:
- title: Event name/title (required)
- startDateTime: ISO 8601 format (required)
- endDateTime: ISO 8601 format (required, default to 1 hour after start if not specified)
- location: Physical or virtual location (optional)
- description: Brief description (optional)

Rules:
1. Extract all text and information visible in the image
2. For relative dates like "tomorrow", "next week", calculate from current date
3. If only date given (no time), default to 10:00 AM
4. If no end time given, default to 1 hour after start
5. Extract location from addresses, venue names in the image
6. Be thorough - look for dates, times, locations, event names

IMPORTANT: Return ONLY a valid JSON object. Do not wrap it in markdown code blocks or backticks. No additional text.`;

    try {
      // Remove data URI prefix if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg'
          }
        }
      ]);

      const response = await result.response;
      const content = response.text();

      if (!content) {
        throw new Error('No response from Gemini');
      }

      // Extract JSON from markdown code blocks if present
      let jsonString = content.trim();
      
      const codeBlockMatch = jsonString.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1].trim();
      }
      
      jsonString = jsonString.replace(/^`+|`+$/g, '').trim();

      const parsed = JSON.parse(jsonString) as ParsedEventInfo;

      // Validate required fields
      if (!parsed.title || !parsed.startDateTime || !parsed.endDateTime) {
        throw new Error('Missing required event information in image');
      }

      // Validate dates
      const start = new Date(parsed.startDateTime);
      const end = new Date(parsed.endDateTime);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date format');
      }

      if (end <= start) {
        end.setHours(start.getHours() + 1);
        parsed.endDateTime = end.toISOString();
      }

      return parsed;
    } catch (error: any) {
      console.error('Gemini image parsing error:', error);
      
      if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse JSON response from Gemini. The AI returned invalid JSON format.`);
      }
      
      throw new Error(`Failed to extract event info from image: ${error.message || error}`);
    }
  }
}
