import fetch from 'node-fetch';

/**
 * Gemini AI service wrapper.
 * Handles environment variable, timeout, retry, and error handling.
 */
export interface GeminiRequest {
  /** The user message or prompt */
  prompt: string;
  /** Optional system prompt to prepend */
  systemPrompt?: string;
}

export interface GeminiResponse {
  /** The text response from Gemini */
  reply: string;
}

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';
const DEFAULT_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;

/**
 * Build request payload for Gemini API.
 */
function buildPayload({ prompt, systemPrompt }: GeminiRequest) {
  const contents = systemPrompt
    ? [
        { role: 'system', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: prompt }] },
      ]
    : [{ role: 'user', parts: [{ text: prompt }] }];
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }
    const data = await response.json();
    // Extract text from response structure
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return { reply } as GeminiResponse;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Public function to get a reply from Gemini.
 * Implements retry and fallback.
 */
export async function getGeminiReply(request: GeminiRequest): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Fallback when key missing
    return { reply: 'Gemini API key not configured. Please set GEMINI_API_KEY in environment.' };
  }
  const payload = buildPayload(request);
  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    try {
      return await fetchGemini(payload, apiKey, DEFAULT_TIMEOUT_MS);
    } catch (err) {
      attempt++;
      if (attempt > MAX_RETRIES) {
        console.error('Gemini request failed after retries:', err);
        return { reply: 'Sorry, I could not process your request at this time. Please try again later.' };
      }
      // exponential backoff
      const backoff = 200 * Math.pow(2, attempt);
      await new Promise((res) => setTimeout(res, backoff));
    }
  }
  // Should never reach here
  return { reply: 'Unexpected error.' };
}
