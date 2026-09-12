"use server";

import { askNaanoChat, type ChatMessage } from "@/lib/groq-chat";

export type ChatReply = {
  reply?: string;
  error?: string;
};

export async function sendPageChat(input: {
  prompt: string;
  history?: ChatMessage[];
}): Promise<ChatReply> {
  const result = await askNaanoChat(input.prompt, input.history ?? []);
  if (!result.ok) {
    return { error: result.error };
  }
  return { reply: result.reply };
}
