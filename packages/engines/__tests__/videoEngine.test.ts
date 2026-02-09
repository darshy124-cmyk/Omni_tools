import { describe, it, expect } from "vitest";
import { videoEngine } from "../src/videoEngine.js";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

ffmpeg.setFfmpegPath(ffmpegPath || "");

const createSampleVideo = async () => {
  const outputPath = path.join(os.tmpdir(), `omni-video-${Date.now()}.mp4`);
  await new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input("color=c=black:s=320x240:d=1")
      .inputFormat("lavfi")
      .outputOptions(["-pix_fmt", "yuv420p"])
      .on("error", reject)
      .on("end", resolve)
      .save(outputPath);
  });
  const buffer = await fs.readFile(outputPath);
  await fs.unlink(outputPath);
  return buffer;
};

describe("videoEngine", () => {
  it("compresses video", async () => {
    const buffer = await createSampleVideo();
    const result = await videoEngine({ buffer, params: { action: "compress" } });
    expect(result.buffer).toBeInstanceOf(Buffer);
  });
});
