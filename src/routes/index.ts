import { Router } from "express";
import type { Request, Response } from "express";
import { getNews } from "../lib/get-news";
import { generateScripts } from "../lib/generate-script";
import { generateAudio } from "../lib/generate-audio";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Server is all set",
  });
});

router.get("/get-news", async (req: Request, res: Response) => {
  try {
    const {
      query,
      maxResults = "5",
      country = "IN",
    } = req.query as { query: string; maxResults: string; country: string };

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "query is required and must be a string",
      });
    }

    const results = await getNews(query, maxResults, country);
    const scripts = await generateScripts(results);

    res.json({
      success: true,
      scripts,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/tts", async (req: Request, res: Response) => {
  try {
    const { audioScript } = req.body;

    if (!audioScript) {
      return res
        .status(400)
        .json({ success: false, message: "audioScript required" });
    }

    const audioUrl = await generateAudio(audioScript);

    res.json({ success: true, audioUrl });
  } catch (err) {
    console.error("TTS error:", err);
    res.status(500).json({ success: false, message: "TTS failed" });
  }
});

export default router;
