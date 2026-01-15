import Perplexity from "@perplexity-ai/perplexity_ai";
import { env } from "./env";
export const client = new Perplexity({
  apiKey: env.PERPLEXITY_API_KEY,
});
