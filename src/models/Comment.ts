import { Schema, model } from "mongoose";

const CommentSchema = new Schema(
  {
    blogId: { type: Schema.Types.ObjectId, ref: "BlogDraft" },
    userId: String,
    username: String,
    content: String,
  },
  { timestamps: true }
);

export const Comment = model("Comment", CommentSchema);
