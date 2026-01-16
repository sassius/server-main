import { Router } from "express";
import { Comment } from "../models/Comment";

const router = Router();

router.post("/:blogId", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body missing. Send JSON with userId, username, content",
      });
    }

    const { userId, username, content } = req.body;

    if (!userId || !username || !content) {
      return res.status(400).json({
        success: false,
        message: "userId, username, and content are required",
      });
    }

    const comment = await Comment.create({
      blogId: req.params.blogId,
      userId,
      username,
      content,
    });

    res.json({ success: true, comment });
  } catch (e) {
    console.error("Comment error:", e);
    res.status(500).json({ success: false, message: "Failed to post comment" });
  }
});

router.get("/:blogId", async (req, res) => {
  try {
    const comments = await Comment.find({ blogId: req.params.blogId }).sort({
      createdAt: 1,
    });
    res.json({ success: true, comments });
  } catch (e) {
    console.error("Get comments error:", e);
    res.status(500).json({ success: false, message: "Failed to get comments" });
  }
});

export default router;
