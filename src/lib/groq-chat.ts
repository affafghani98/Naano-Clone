/** Groq retired llama-3.3-70b-versatile (Aug 2026); use their recommended replacement. */
const DEFAULT_MODEL = "openai/gpt-oss-120b";

const SYSTEM_PROMPT = `You are Naano's in-app assistant for a B2B LinkedIn creator marketplace.
Answer in one short line whenever possible. No fluff, no lists unless asked.
If the user needs steps, keep them ultra-brief. Prefer plain language.
You help with brand booking, campaigns, wallet, creators, and creator opportunities.`;

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatResult =
  | { ok: true; reply: string }
  | { ok: false; error: string };

export async function askNaanoChat(
  prompt: string,
  history: ChatMessage[] = [],
): Promise<ChatResult> {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return { ok: false, error: "Ask a question first." };
  }
  if (trimmed.length > 1000) {
    return { ok: false, error: "Keep questions under 1,000 characters." };
  }

  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      error: "Add GROQ_API_KEY to .env to enable chat.",
    };
  }

  const model = process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL;
  const recent = history.slice(-8).map((message) => ({
    role: message.role,
    content: message.content.slice(0, 1000),
  }));

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
          temperature: 0.3,
          max_tokens: 120,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...recent,
            { role: "user", content: trimmed },
          ],
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      console.error("[naano-chat] Groq error:", response.status, body);
      return { ok: false, error: "Chat request failed. Try again." };
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return { ok: false, error: "No reply from the model." };
    }
    return { ok: true, reply };
  } catch (error) {
    console.error("[naano-chat]", error);
    return { ok: false, error: "Chat is temporarily unavailable." };
  }
}
