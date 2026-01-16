import { generateText } from "ai";
import { openrouter } from "../config/open-router";
import { env } from "../config/env";

export async function generateDraft(news: any[]) {
  const input = news
    .map(
      (n) => `
Title: ${n.title}
Summary: ${n.summary}
Source: ${n.url}
`
    )
    .join("\n");

  const res = await generateText({
    model: openrouter.chat(env.MODEL!),
    prompt: `
Return ONLY valid JSON. No markdown. No backticks. No explanation.

Format:
{
 "headline": "...",
 "summary": "...",
 "verdict": "verified|uncertain|false",
 "reasoning": "...",
 "sources": ["url1","url2"]
}

News:
${input}
    `,
    temperature: 0.3,
  });

  const raw = res.text.trim();
  console.log("RAW LLM OUTPUT:\n", raw);

  // Extract first JSON block safely
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in LLM output");
  }

  const jsonString = raw.slice(start, end + 1);

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("JSON PARSE FAILED. Raw:\n", raw);
    throw e;
  }
}
