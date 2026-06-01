import { NextResponse } from "next/server";
import { getGeminiReply } from "@/services/ai/gemini";

export async function POST(request: Request) {
  try {
    const { prompt, systemPrompt, customApiKey, preferences } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const response = await getGeminiReply({ 
      prompt, 
      systemPrompt, 
      customApiKey, 
      preferences 
    });

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Gemini API route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export const runtime = "nodejs";
