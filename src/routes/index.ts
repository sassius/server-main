import { Router } from "express";
import type { Request, Response } from "express";
import { getNews } from "../lib/get-news";
import { generateScripts } from "../lib/generate-script";
import { generateAudio } from "../lib/generate-audio";

import discussionRoutes from "./discussions";
import audioMetaRoutes from "./audio";

const router = Router();

/* ---------- Health ---------- */
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Server is all set",
  });
});

/* ---------- News + Script ---------- */
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

/* ---------- TTS ---------- */
router.post("/tts", async (req: Request, res: Response) => {
  try {
    const { audioScript, userId = "guest", newsId = "general" } = req.body;

    if (!audioScript) {
      return res
        .status(400)
        .json({ success: false, message: "audioScript required" });
    }

    const audioUrl = await generateAudio(audioScript, userId, newsId);

    res.json({ success: true, audioUrl });
  } catch (err) {
    console.error("TTS error:", err);
    res.status(500).json({ success: false, message: "TTS failed" });
  }
});

/* ---------- Discussion Forum ---------- */
router.use("/discussions", discussionRoutes);

/* ---------- Audio Metadata ---------- */
router.use("/audio-meta", audioMetaRoutes);

export default router;
