import { Schema, model } from "mongoose";

const BlogDraftSchema = new Schema(
  {
    topic: String,
    headline: String,
    summary: String,
    verdict: String, // verified | uncertain | false
    reasoning: String,
    sources: [String],
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const BlogDraft = model("BlogDraft", BlogDraftSchema);
