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
    const contentType = request.headers.get('content-type') || '';
    let body: any;
    let imageBase64: string | null = null;

    // Handle multipart form data (image upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const imageFile = formData.get('image') as File;
      
      if (imageFile) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        imageBase64 = buffer.toString('base64');
        body = { imageData: imageBase64 };
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'No image file provided',
          },
          { status: 400 }
        );
      }
    } else {
      // Handle JSON data
      body = await request.json();
    }

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
    let eventInfo: any;

    // Handle image upload directly
    if (body.imageData) {
      console.log('Processing uploaded image with Perplexity...');
      eventInfo = await perplexityParser.parseEventFromImage(body.imageData);
    }
    // Extract from Instagram URL
    else if (body.instagramUrl) {
      const normalizedUrl = normalizeInstagramUrl(body.instagramUrl);
      const postData = await instagramExtractor.extractFromUrl(normalizedUrl);
      extractedText = postData.caption || '';
      sourceUrl = normalizedUrl;
      context = `Instagram post by ${postData.username || 'unknown'}`;
      
      console.log('Extracted from Instagram:', postData);
      
      // Parse event info using Perplexity
      console.log('Parsing with Perplexity:', extractedText);
      eventInfo = await perplexityParser.parseEventInfo(extractedText, context);
    } 
    // Or use plain text
    else if (body.text) {
      extractedText = body.text;
      
      // Parse event info using Perplexity
      console.log('Parsing with Perplexity:', extractedText);
      eventInfo = await perplexityParser.parseEventInfo(extractedText, context);
    }
    else {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide an Instagram URL, text, or image',
        },
        { status: 400 }
      );
    }

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
