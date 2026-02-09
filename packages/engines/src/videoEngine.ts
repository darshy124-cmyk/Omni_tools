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

export const videoEngine: Engine = async ({ buffer, params }) => {
  if (!buffer) throw new Error("Video buffer required");
  const action = params?.action as string;
  const inputPath = await writeTempFile(buffer, ".mp4");
  const outputExt =
    action === "gif"
      ? ".gif"
      : action === "thumbnail"
        ? ".png"
        : action === "extract-audio"
          ? ".mp3"
          : ".mp4";
  const outputPath = path.join(
    os.tmpdir(),
    `omni-out-${Date.now()}-${Math.random()}${outputExt}`
  );

  const command = ffmpeg(inputPath);
  switch (action) {
    case "compress":
      command.videoBitrate("800k");
      break;
    case "gif":
      command.outputOptions(["-vf", "fps=10,scale=480:-1:flags=lanczos", "-f", "gif"]);
      break;
    case "mute":
      command.noAudio();
      break;
    case "clip":
      command.setStartTime(0).setDuration(5);
      break;
    case "resize":
      command.size("640x?");
      break;
    case "rotate":
      command.videoFilters("transpose=1");
      break;
    case "speed":
      command.videoFilters("setpts=0.5*PTS");
      break;
    case "thumbnail":
      command.outputOptions(["-vframes", "1"]);
      break;
    case "extract-audio":
      command.noVideo().audioCodec("libmp3lame");
      break;
    case "watermark":
      command.videoFilters(
        "drawtext=text='OmniTool':x=10:y=10:fontcolor=white:fontsize=24:box=1:boxcolor=black@0.5"
      );
      break;
    default:
      break;
  }

  await new Promise<void>((resolve, reject) => {
    command.on("error", reject).on("end", resolve).save(outputPath);
  });

  const output = await readTempFile(outputPath);
  await fs.unlink(inputPath);
  const isImage = action === "thumbnail" || action === "gif";
  const isAudio = action === "extract-audio";
  return {
    buffer: output,
    mimeType: isImage
      ? action === "gif"
        ? "image/gif"
        : "image/png"
      : isAudio
        ? "audio/mpeg"
        : "video/mp4",
    metadata: { action }
  };
};
