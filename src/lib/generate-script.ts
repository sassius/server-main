import type { GeneratedScripts, FactCheckedNews } from "../types";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { env } from "../config/env";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function generateScripts(
  newsList: FactCheckedNews[]
): Promise<GeneratedScripts> {
  if (!newsList.length) {
    throw new Error("No news provided");
  }

  const blogNews = newsList.filter(
    (n) => n.verdict === "verified" || n.verdict === "uncertain" // speculation
  );

  const audioNews = newsList.filter((n) => n.verdict === "verified");

  if (!blogNews.length) {
    throw new Error("No news for blog");
  }

  if (!audioNews.length) {
    throw new Error("No verified news for audio");
  }

  const blogInput = blogNews
    .map(
      (n, i) => `
${i + 1}. ${n.title}
Summary: ${n.summary}
Source: ${n.url}
Fact Check: ${n.verdict === "verified" ? "VERIFIED" : "SPECULATION"}
Reason: ${n.reasoning}
`
    )
    .join("\n");

  const audioInput = audioNews
    .map(
      (n, i) => `
${i + 1}. ${n.title}
Summary: ${n.summary}
Source: ${n.url}
`
    )
    .join("\n");

  /* -------- BLOG (VERIFIED + SPECULATION) -------- */
  const blogResponse = await generateText({
    model: openrouter.chat(env.MODEL!),
    prompt: `
You are a professional journalist.

Rules:
- Include verified and speculative news
- Clearly label speculative parts as speculation
- Neutral tone
- 400–600 words
- End with Sources

News:
${blogInput}
    `,
    temperature: 0.6,
  });

  /* -------- AUDIO (VERIFIED ONLY) -------- */
  const audioResponse = await generateText({
    model: openrouter.chat(env.MODEL!),
    prompt: `
You are a news narrator.

Rules:
- Use ONLY verified news
- Conversational tone
- Short sentences
- No markdown
- No bullet points
- Suitable for TTS
- 60–90 seconds

News:
${audioInput}
    `,
    temperature: 0.5,
  });

  return {
    blogScript: blogResponse.text.trim(),
    audioScript: audioResponse.text.trim(),
  };
}
