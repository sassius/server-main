import "dotenv/config";

export const env = {
  PORT: process.env.PORT ?? 3000,
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  MODEL: process.env.MODEL,
};
