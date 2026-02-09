import { Engine } from "./types.js";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

if (!ffmpegPath) {
  throw new Error("ffmpeg binary not available");
}
ffmpeg.setFfmpegPath(ffmpegPath);

const writeTempFile = async (buffer: Buffer, ext: string) => {
  const filePath = path.join(os.tmpdir(), `omni-${Date.now()}-${Math.random()}${ext}`);
  await fs.writeFile(filePath, buffer);
  return filePath;
};

const readTempFile = async (filePath: string) => {
  const data = await fs.readFile(filePath);
  await fs.unlink(filePath);
  return data;
};

export const audioEngine: Engine = async ({ buffer, buffers = [], params }) => {
  if (!buffer) throw new Error("Audio buffer required");
  const action = params?.action as string;
  const inputPath = await writeTempFile(buffer, ".mp3");
  const outputPath = path.join(os.tmpdir(), `omni-audio-${Date.now()}-${Math.random()}.mp3`);
  const command = ffmpeg(inputPath);

  switch (action) {
    case "compress":
      command.audioBitrate("96k");
      break;
    case "trim":
      command.setStartTime(0).setDuration(5);
      break;
    case "convert":
      command.audioCodec("libmp3lame");
      break;
    case "normalize":
      command.audioFilters("loudnorm");
      break;
    case "fade":
      command.audioFilters("afade=t=in:st=0:d=2,afade=t=out:st=4:d=1");
      break;
    case "split":
      command.setStartTime(0).setDuration(5);
      break;
    case "merge": {
      if (buffers.length < 2) break;
      const files = await Promise.all(
        buffers.map((item, index) => writeTempFile(item, `-${index}.mp3`))
      );
      const concatList = files.map((file) => `file '${file}'`).join("\n");
      const listPath = path.join(os.tmpdir(), `omni-list-${Date.now()}.txt`);
      await fs.writeFile(listPath, concatList);
      await new Promise<void>((resolve, reject) => {
        ffmpeg()
          .input(listPath)
          .inputOptions(["-f", "concat", "-safe", "0"])
          .outputOptions(["-c", "copy"])
          .on("error", reject)
          .on("end", resolve)
          .save(outputPath);
      });
      await Promise.all(files.map((file) => fs.unlink(file)));
      await fs.unlink(listPath);
      const output = await readTempFile(outputPath);
      await fs.unlink(inputPath);
      return { buffer: output, mimeType: "audio/mpeg", metadata: { action } };
    }
    case "speed":
      command.audioFilters("atempo=1.5");
      break;
    case "mono":
      command.outputOptions(["-ac", "1"]);
      break;
    case "extract":
      command.audioCodec("libmp3lame");
      break;
    default:
      break;
  }

  await new Promise<void>((resolve, reject) => {
    command.on("error", reject).on("end", resolve).save(outputPath);
  });

  const output = await readTempFile(outputPath);
  await fs.unlink(inputPath);
  return { buffer: output, mimeType: "audio/mpeg", metadata: { action } };
};
