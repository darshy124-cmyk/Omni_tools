import { createWorker } from "tesseract.js";
import { Engine } from "./types.js";

export const ocrEngine: Engine = async ({ buffer, params }) => {
  if (!buffer) throw new Error("OCR buffer required");
  const language = (params?.language as string) || "eng";
  const worker = await createWorker(language);
  const result = await worker.recognize(buffer);
  await worker.terminate();
  return { text: result.data.text };
};
