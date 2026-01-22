import { NextRequest, NextResponse } from 'next/server';
import { InstagramExtractor } from '@/lib/services/instagram-extractor';
import { PerplexityParser } from '@/lib/services/perplexity-parser';
import { CalendarGenerator } from '@/lib/services/calendar-generator';
import { ExtractionRequestSchema, normalizeInstagramUrl } from '@/lib/utils/validators';
import { ExtractionRequest, ExtractionResponse } from '@/lib/types';

const instagramExtractor = new InstagramExtractor();
const calendarGenerator = new CalendarGenerator();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = ExtractionRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const { instagramUrl, text, imageUrl } = validation.data as ExtractionRequest;

    // Validate Perplexity API key
    if (!process.env.PERPLEXITY_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Perplexity API key not configured',
        },
        { status: 500 }
      );
    }

    const perplexityParser = new PerplexityParser(process.env.PERPLEXITY_API_KEY);

    let extractedText = '';
    let sourceUrl = '';
    let context = '';

    // Extract from Instagram URL
    if (instagramUrl) {
      const normalizedUrl = normalizeInstagramUrl(instagramUrl);
      const postData = await instagramExtractor.extractFromUrl(normalizedUrl);
      extractedText = postData.caption || '';
      sourceUrl = normalizedUrl;
      context = `Instagram post by ${postData.username || 'unknown'}`;
      
      console.log('Extracted from Instagram:', postData);
    } 
    // Or use plain text
    else if (text) {
      extractedText = text;
    }
    // Or handle image (future: OCR)
    else if (imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Image URL processing not yet implemented. Please provide text or Instagram URL.',
        },
        { status: 400 }
      );
    }

    if (!extractedText) {
      return NextResponse.json(
        {
          success: false,
          error: 'No text content found to parse',
        },
        { status: 400 }
      );
    }

    // Parse event info using Perplexity
    console.log('Parsing with Perplexity:', extractedText);
    const eventInfo = await perplexityParser.parseEventInfo(extractedText, context);

    // Generate Google Calendar URL
    const calendarUrl = calendarGenerator.generateGoogleCalendarUrl(eventInfo, sourceUrl);

    // Get all calendar URLs
    const allUrls = calendarGenerator.generateMultipleUrls(eventInfo, sourceUrl);

    const response: ExtractionResponse = {
      success: true,
      calendarUrl,
      eventInfo: {
        ...eventInfo,
        googleUrl: allUrls.google,
        outlookUrl: allUrls.outlook,
        appleUrl: allUrls.apple,
      } as any,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to convert to calendar event',
      },
      { status: 500 }
    );
  }
}
