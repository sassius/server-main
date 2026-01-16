import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { Readable } from "stream";
import crypto from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../config/r2";
import { Audio } from "../models/Audio";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

function hashText(text: string) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

export async function generateAudio(
  text: string,
  userId = "guest",
  newsId = "general"
): Promise<string> {
  const hash = hashText(text);

  // 1) Check if already exists
  const existing = await Audio.findOne({ hash, userId });
  if (existing) return existing.audioUrl;

  // 2) Generate from ElevenLabs
  const webStream = await elevenlabs.textToSpeech.convert(
    "JBFqnCBsd6RMkjVDRZzb",
    {
      text,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
    }
  );

  const buffer = Buffer.from(await new Response(webStream as any).arrayBuffer());
  const fileName = `tts_${hash}.mp3`;

  // 3) Upload to R2
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: fileName,
      Body: buffer,
      ContentType: "audio/mpeg",
    })
  );

  const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;

  // 4) Save to DB
  await Audio.create({
    userId,
    newsId,
    hash,
    audioUrl: publicUrl,
  });

  return publicUrl;
}
