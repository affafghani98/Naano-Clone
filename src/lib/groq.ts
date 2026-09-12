/** Groq retired llama-3.3-70b-versatile (Aug 2026); use their recommended replacement. */
export const GROQ_DEFAULT_MODEL = "openai/gpt-oss-120b";

export function getGroqConfig() {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  const model = process.env.GROQ_MODEL?.trim() || GROQ_DEFAULT_MODEL;
  return { apiKey, model };
}

export async function callGroqChat(input: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const { apiKey, model } = getGroqConfig();
  if (!apiKey) {
    return { ok: false, error: "Add GROQ_API_KEY to .env to enable AI generation." };
  }

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: input.temperature ?? 0.4,
          max_tokens: input.maxTokens ?? 900,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: input.system },
            { role: "user", content: input.user },
          ],
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      console.error("[naano-groq] error:", response.status, body);
      return { ok: false, error: "AI request failed." };
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return { ok: false, error: "Empty AI response." };
    }
    return { ok: true, text };
  } catch (error) {
    console.error("[naano-groq]", error);
    return { ok: false, error: "AI is temporarily unavailable." };
  }
}

export function parseJsonObject(raw: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start < 0 || end <= start) {
      return null;
    }
    try {
      const parsed: unknown = JSON.parse(raw.slice(start, end + 1));
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return null;
      }
      return parsed as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
