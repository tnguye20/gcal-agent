import { NextRequest, NextResponse } from 'next/server';
import { PerplexityParser } from '@/lib/services/perplexity-parser';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text required' },
        { status: 400 }
      );
    }

    if (!process.env.PERPLEXITY_API_KEY) {
      return NextResponse.json(
        { error: 'Perplexity API key not configured' },
        { status: 500 }
      );
    }

    const perplexityParser = new PerplexityParser(process.env.PERPLEXITY_API_KEY);
    const eventInfo = await perplexityParser.parseEventInfo(text);
    
    return NextResponse.json({ success: true, eventInfo });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
