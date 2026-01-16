import { Router } from "express";
import type { Request, Response } from "express";
import { getNews } from "../lib/get-news";
import { generateScripts } from "../lib/generate-script";
import { generateAudio } from "../lib/generate-audio";
import { factCheckNews } from "../lib/fact-check";

import discussionRoutes from "./discussions";
import audioMetaRoutes from "./audio";
import { BlogDraft } from "../models/BlogDraft";
import { generateDraft } from "../lib/generate-draft";
import commentRoutes from "./comments";

const router = Router();

/* ---------- Health ---------- */
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Server is all set",
  });
});

/* ---------- News + Fact Check + Scripts ---------- */
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
    const checked = await factCheckNews(results);
    const scripts = await generateScripts(checked);

    res.json({
      success: true,
      factCheckedNews: checked,
      scripts,
    });
  } catch (error) {
    console.error("Get News API error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* ---------- Topic → News ---------- */
router.post("/topic", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ success: false, message: "topic required" });
    }

    const news = await getNews(topic, "5", "IN");
    res.json({ success: true, news });
  } catch (e) {
    console.error("Topic error:", e);
    res.status(500).json({ success: false, message: "Failed to fetch topic news" });
  }
});

/* ---------- News → Draft ---------- */
router.post("/draft", async (req, res) => {
  try {
    const { topic, news } = req.body;

    if (!topic || !Array.isArray(news)) {
      return res
        .status(400)
        .json({ success: false, message: "topic and news[] required" });
    }

    const draftData = await generateDraft(news);
    const saved = await BlogDraft.create({
      topic,
      ...draftData,
    });

    res.json({ success: true, draft: saved });
  } catch (e) {
    console.error("Draft error:", e);
    res.status(500).json({ success: false, message: "Draft generation failed" });
  }
});

/* ---------- Draft → Audio ---------- */
router.post("/draft/:id/audio", async (req, res) => {
  try {
    const draft = await BlogDraft.findById(req.params.id);
    if (!draft) {
      return res.status(404).json({ success: false, message: "Draft not found" });
    }

    if (!draft.summary) {
      return res.status(400).json({ success: false, message: "Draft has no summary" });
    }

    const audioUrl = await generateAudio(draft.summary, "guest", draft._id.toString());
    res.json({ success: true, audioUrl });
  } catch (e) {
    console.error("Draft audio error:", e);
    res.status(500).json({ success: false, message: "Audio generation failed" });
  }
});

/* ---------- Publish Draft ---------- */
router.post("/draft/:id/publish", async (req, res) => {
  try {
    const blog = await BlogDraft.findByIdAndUpdate(
      req.params.id,
      { isPublished: true },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ success: false, message: "Draft not found" });
    }

    res.json({ success: true, blog });
  } catch (e) {
    console.error("Publish error:", e);
    res.status(500).json({ success: false, message: "Publish failed" });
  }
});

/* ---------- Public Feed ---------- */
router.get("/feed", async (req, res) => {
  try {
    const blogs = await BlogDraft.find({ isPublished: true }).sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (e) {
    console.error("Feed error:", e);
    res.status(500).json({ success: false, message: "Failed to load feed" });
  }
});

/* ---------- Blog Comments ---------- */
router.use("/comments", commentRoutes);

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
