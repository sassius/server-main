import { Router } from "express";
import { Discussion } from "../models/discussion";

const router = Router();

router.post("/", async (req, res) => {
  const { newsId, content, userId, username } = req.body;
  const post = await Discussion.create({
    newsId,
    content,
    userId,
    username,
    parentId: null,
  });
  res.json({ success: true, post });
});

router.get("/:newsId", async (req, res) => {
  const threads = await Discussion.find({ newsId: req.params.newsId });
  res.json({ success: true, threads });
});

router.post("/:id/reply", async (req, res) => {
  const { content, userId, username } = req.body;
  const reply = await Discussion.create({
    parentId: req.params.id,
    content,
    userId,
    username,
  });
  res.json({ success: true, reply });
});

router.post("/:id/vote", async (req, res) => {
  const { type } = req.body; // up | down
  const field = type === "up" ? "upvotes" : "downvotes";
  const post = await Discussion.findByIdAndUpdate(
    req.params.id,
    { $inc: { [field]: 1 } },
    { new: true }
  );
  res.json({ success: true, post });
});

export default router;
