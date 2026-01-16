import { Router } from "express";
import { Audio } from "../models/Audio";

const router = Router();

router.get("/", async (req, res) => {
  const { userId } = req.query;
  const audios = await Audio.find(userId ? { userId } : {}).sort({ createdAt: -1 });
  res.json({ success: true, audios });
});

export default router;
