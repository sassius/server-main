import { Schema, model } from "mongoose";

const AudioSchema = new Schema(
  {
    userId: String,
    newsId: String,
    hash: String,      // unique from audioScript
    audioUrl: String, // R2 public URL
  },
  { timestamps: true }
);

export const Audio = model("Audio", AudioSchema);
