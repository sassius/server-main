import { Schema, model } from "mongoose";

const DiscussionSchema = new Schema(
  {
    newsId: String,
    parentId: { type: String, default: null },
    userId: String,
    username: String,
    content: String,
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Discussion = model("Discussion", DiscussionSchema);
