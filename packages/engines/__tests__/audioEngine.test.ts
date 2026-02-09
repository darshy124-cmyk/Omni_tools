import { describe, it, expect } from "vitest";
import { audioEngine } from "../src/audioEngine.js";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

ffmpeg.setFfmpegPath(ffmpegPath || "");

const createSampleAudio = async () => {
  const outputPath = path.join(os.tmpdir(), `omni-audio-${Date.now()}.mp3`);
  await new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input("sine=frequency=440:duration=1")
      .inputFormat("lavfi")
      .audioCodec("libmp3lame")
      .on("error", reject)
      .on("end", resolve)
      .save(outputPath);
  });
  const buffer = await fs.readFile(outputPath);
  await fs.unlink(outputPath);
  return buffer;
};

describe("audioEngine", () => {
  it("compresses audio", async () => {
    const buffer = await createSampleAudio();
    const result = await audioEngine({ buffer, params: { action: "compress" } });
    expect(result.buffer).toBeInstanceOf(Buffer);
  });
});
