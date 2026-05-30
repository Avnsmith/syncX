import { NextResponse } from 'next/server';
import { getGeminiReply, GeminiRequest } from '@/services/ai/gemini';

export async function POST(request: Request) {
  try {
    const { prompt, systemPrompt }: GeminiRequest = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    const response = await getGeminiReply({ prompt, systemPrompt });
    return NextResponse.json(response);
  } catch (err) {
    console.error('Gemini API route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'nodejs'; // ensures server-side execution
