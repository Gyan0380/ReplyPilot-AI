import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Connects the AI SDK to the Lovable AI Gateway.
 * The key never leaves the server.
 */
export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
  });
}

export const AI_MODEL = "google/gemini-3.7-flash";
