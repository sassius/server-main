export type News = {
  title: string;
  url: string;
  summary: string;
};

export type GeneratedScripts = {
  blogScript: string;
  audioScript: string;
};
export type FactCheckedNews = News & {
  verdict: "verified" | "uncertain" | "false";
  reasoning: string;
};
