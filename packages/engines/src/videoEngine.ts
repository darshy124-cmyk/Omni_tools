import { Engine } from "./types.js";

export const videoEngine: Engine = async ({ buffer, params }) => {
  if (!buffer) throw new Error("Video buffer required");
  const action = params?.action as string;
  return {
    buffer,
    mimeType: "video/mp4",
    metadata: { action }
  };
};
