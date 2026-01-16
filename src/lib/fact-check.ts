import { generateText } from "ai";
import { openrouter } from "../config/open-router";
import type { News } from "../types";
import { env } from "../config/env";

export type FactCheckedNews = News & {
  verdict: "verified" | "uncertain" | "false";
  reasoning: string;
};

export async function factCheckNews(
  newsList: News[]
): Promise<FactCheckedNews[]> {
  const results: FactCheckedNews[] = [];

  for (const news of newsList) {
    const response = await generateText({
      model: openrouter.chat(env.MODEL!),
      prompt: `
You are a professional fact checker.

Check the following news item:
Title: ${news.title}
Summary: ${news.summary}
Source: ${news.url}

Steps:
1. Search your knowledge + logic.
2. Decide if it is:
   - verified
   - uncertain
   - false
3. Give short reasoning.

Return JSON only like:
{
  "verdict": "verified|uncertain|false",
  "reasoning": "..."
}
      `,
      temperature: 0.2,
    });

    const parsed = JSON.parse(response.text);

    results.push({
      ...news,
      verdict: parsed.verdict,
      reasoning: parsed.reasoning,
    });
  }

  return results;
}
