import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

export async function generateAudio(text: string): Promise<string> {
  const webStream = await elevenlabs.textToSpeech.convert(
    "JBFqnCBsd6RMkjVDRZzb",
    {
      text,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
    }
  );

  const dir = path.join(process.cwd(), "public/audio");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const fileName = `tts_${Date.now()}.mp3`;
  const filePath = path.join(dir, fileName);

  const writeStream = fs.createWriteStream(filePath);

  // Convert Web ReadableStream → Node Readable
  const nodeStream = Readable.fromWeb(webStream as any);

  nodeStream.pipe(writeStream);

  await new Promise<void>((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  return `/audio/${fileName}`;
}
