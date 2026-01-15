import { Schema, model } from "mongoose";

const AudioSchema = new Schema(
  {
    userId: String,
    newsId: String,
    filePath: String,
  },
  { timestamps: true }
);

export const Audio = model("Audio", AudioSchema);
