import { client } from "../config/perplexity";

export async function getNews(
  query: string,
  maxResults: string,
  country?: string
) {
  const search = await client.search.create({
    query,
    max_results: Number(maxResults),
    max_tokens: 25_000,
    max_tokens_per_page: 2048,
    country,
  });

  const results = search.results.map((r) => ({
    title: r.title,
    url: r.url,
    summary: r.snippet,
  }));

  return results;
}
