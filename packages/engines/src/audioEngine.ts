import { Engine } from "./types.js";

export const audioEngine: Engine = async ({ buffer, params }) => {
  if (!buffer) throw new Error("Audio buffer required");
  const action = params?.action as string;
  return {
    buffer,
    mimeType: "audio/mpeg",
    metadata: { action }
  };
};
