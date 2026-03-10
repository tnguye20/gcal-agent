import { NextRequest, NextResponse } from 'next/server';
import { GeminiParser } from '@/lib/services/gemini-parser';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const geminiParser = new GeminiParser(process.env.GEMINI_API_KEY);
    const eventInfo = await geminiParser.parseEventInfo(text);
    
    return NextResponse.json({ success: true, eventInfo });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
