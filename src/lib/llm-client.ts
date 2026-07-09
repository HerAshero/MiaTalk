import { optionalEnv, requireEnv } from "@/lib/env";
import type { ModelConfig } from "@/lib/types";

type GenerateJsonInput = {
  modelProvider: "deepseek";
  model: string;
  modelConfig: ModelConfig;
  systemPrompt: string;
  userPayload: unknown;
};

export type LlmJsonResult = {
  rawText: string;
  parsed: unknown | null;
  parseError: string | null;
};

export async function generateJson(input: GenerateJsonInput): Promise<LlmJsonResult> {
  const baseUrl = optionalEnv("DEEPSEEK_BASE_URL", "https://api.deepseek.com");
  const apiKey = requireEnv("DEEPSEEK_API_KEY");

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: input.model,
      messages: [
        { role: "system", content: input.systemPrompt },
        { role: "user", content: JSON.stringify(input.userPayload) }
      ],
      temperature: input.modelConfig.temperature ?? 0.7,
      max_tokens: input.modelConfig.max_tokens ?? 800,
      response_format:
        input.modelConfig.response_format === "json_object"
          ? { type: "json_object" }
          : undefined
    })
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      `DeepSeek API error ${response.status}: ${JSON.stringify(body)}`
    );
  }

  const rawText = body?.choices?.[0]?.message?.content ?? "";
  try {
    return { rawText, parsed: JSON.parse(rawText), parseError: null };
  } catch (error) {
    return {
      rawText,
      parsed: null,
      parseError: error instanceof Error ? error.message : "Unknown JSON parse error"
    };
  }
}
