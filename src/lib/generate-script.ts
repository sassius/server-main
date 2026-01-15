import type { GeneratedScripts, News } from "../types";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { env } from "../config/env";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function generateScripts(
  newsList: News[]
): Promise<GeneratedScripts> {
  if (!newsList.length) {
    throw new Error("No news provided");
  }

  // Prepare structured input for the model
  const combinedNews = newsList
    .map(
      (n, i) => `
${i + 1}. ${n.title}
Summary: ${n.summary}
Source: ${n.url}
`
    )
    .join("\n");

  /* -------- BLOG DIGEST -------- */
  const blogResponse = await generateText({
    model: openrouter.chat(env.MODEL!),
    prompt: `
You are a professional journalist writing a daily news digest.

Using the news items below:
- Combine them into ONE coherent blog article
- Smooth transitions between stories
- Neutral and informative tone
- 400–600 words
- Clear sections per topic
- End with a "Sources" section listing all links

News:
${combinedNews}
    `,
    temperature: 0.6,
  });

  /* -------- AUDIO DIGEST (ElevenLabs) -------- */
  const audioResponse = await generateText({
    model: openrouter.chat(env.MODEL!),
    prompt: `
You are a news narrator creating a daily audio briefing.

Rewrite the news below as ONE continuous spoken script.
Rules:
- Conversational and natural
- Short sentences
- No markdown
- No bullet points
- Clear transitions like "In other news" or "Meanwhile"
- Suitable for ElevenLabs text-to-speech
- 60–90 seconds when spoken

News:
${combinedNews}
    `,
    temperature: 0.5,
  });

  return {
    blogScript: blogResponse.text.trim(),
    audioScript: audioResponse.text.trim(),
  };
}
