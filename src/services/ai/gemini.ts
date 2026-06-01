import fetch from "node-fetch";

export interface GeminiRequest {
  prompt: string;
  systemPrompt?: string;
  customApiKey?: string;
  preferences?: {
    responseStyle?: "concise" | "detailed" | "friendly";
    riskSensitivity?: "low" | "medium" | "high";
    transactionGuidance?: boolean;
  };
}

export interface GeminiResponse {
  reply: string;
}

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";
const DEFAULT_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;

/**
 * Build request payload for Gemini API.
 */
function buildPayload({ prompt, systemPrompt, preferences }: GeminiRequest) {
  let finalSystemPrompt = "You are SyncX AI, a premium, intelligent, safe financial assistant for the SyncX application. " +
    "SyncX is a consumer financial fintech app offering real-time stablecoin swaps, CCTP bridges, and unified balance capabilities. ";

  if (systemPrompt) {
    finalSystemPrompt += systemPrompt + " ";
  }

  // Inject preferences into system prompt
  if (preferences) {
    if (preferences.responseStyle === "concise") {
      finalSystemPrompt += "Provide extremely concise, direct, clear one-to-two sentence answers without extra fluff. ";
    } else if (preferences.responseStyle === "detailed") {
      finalSystemPrompt += "Provide a detailed, thorough, highly educational response, outlining background context, step-by-step guidance, and network details. ";
    } else if (preferences.responseStyle === "friendly") {
      finalSystemPrompt += "Reply in a warm, welcoming, supportive, and friendly customer-focused tone. ";
    }

    if (preferences.riskSensitivity === "high") {
      finalSystemPrompt += "Be highly conservative and cautious. Always remind users to verify the recipient addresses, transaction amounts, gas limits, and slippage tolerances before executing any swap or transfer. ";
    } else if (preferences.riskSensitivity === "medium") {
      finalSystemPrompt += "Provide balanced risk warnings. Advise standard caution before sending or swapping. ";
    }

    if (preferences.transactionGuidance) {
      finalSystemPrompt += "You should offer helpful transaction guidance. For example, explain how to copy addresses or how to verify gas fees when asked. ";
    }
  }

  const contents = [
    { role: "user", parts: [{ text: `[System Instructions: ${finalSystemPrompt}]\nUser: ${prompt}` }] }
  ];
  return { contents };
}

/**
 * Perform the actual fetch with timeout.
 */
async function fetchGemini(payload: any, apiKey: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }
    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return { reply } as GeminiResponse;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Public function to get a reply from Gemini.
 * Implements retry, custom api key validation, and style preferences.
 */
export async function getGeminiReply(request: GeminiRequest): Promise<GeminiResponse> {
  const apiKey = request.customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE" || apiKey.trim() === "") {
    return { 
      reply: "Gemini API Key is not configured. Please navigate to the Settings page, configure a valid Gemini API Key, and verify the connection to activate the AI assistant." 
    };
  }
  const payload = buildPayload(request);
  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    try {
      return await fetchGemini(payload, apiKey, DEFAULT_TIMEOUT_MS);
    } catch (err) {
      attempt++;
      if (attempt > MAX_RETRIES) {
        console.error("Gemini request failed after retries:", err);
        return { 
          reply: "I encountered an error trying to process your request. Please check that your Gemini API Key is active in Settings, or try again in a few moments." 
        };
      }
      const backoff = 200 * Math.pow(2, attempt);
      await new Promise((res) => setTimeout(res, backoff));
    }
  }
  return { reply: "Unexpected error." };
}
