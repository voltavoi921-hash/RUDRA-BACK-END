import axios from 'axios';
import { logger } from './logger.js';

/**
 * Generate a response from the configured AI provider.
 *
 * Currently attempts to call Google's Generative Language (Gemini) API.
 * If no GEMINI_API_KEY is configured, returns a friendly fallback message.
 */
export async function generateAIResponse(userInput: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return '⚠️ AI is not configured. Please set GEMINI_API_KEY in your environment.';
  }

  const model = process.env.GEMINI_MODEL || 'text-bison-001';

  // Try both v1 and v1beta2 endpoints; some keys/regions may support only one.
  const endpoints = [
    `https://generativelanguage.googleapis.com/v1/models/${model}:generate`,
    `https://generativelanguage.googleapis.com/v1beta2/models/${model}:generate`,
  ];

  const payload = {
    prompt: {
      text: userInput,
    },
    // Keep responses reasonably sized for Discord.
    maxOutputTokens: 512,
    temperature: 0.8,
  } as const;

  let lastError: unknown;

  for (const baseUrl of endpoints) {
    const url = `${baseUrl}?key=${encodeURIComponent(apiKey)}`;
    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15_000,
      });

      const output =
        response?.data?.candidates?.[0]?.output || response?.data?.output?.[0]?.content;

      if (typeof output === 'string' && output.trim().length > 0) {
        return output.trim();
      }

      return '⚠️ I couldn\'t generate a response. Please try again.';
    } catch (err: any) {
      lastError = err;
      // If this endpoint isn't supported, try the next one.
      const status = err?.response?.status;
      if (status === 404 || status === 403) {
        logger.warn('⚠️ Gemini API endpoint returned status', status, '(trying fallback endpoint)');
        continue;
      }

      // For other errors, rethrow so callers can handle it.
      throw err;
    }
  }

  logger.warn('⚠️ Gemini API calls failed: returning fallback message', lastError);
  return '⚠️ I couldn\'t reach the AI service. Please check your configuration and try again.';
}
