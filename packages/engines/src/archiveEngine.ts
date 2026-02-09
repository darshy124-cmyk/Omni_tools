import JSZip from "jszip";
import { Engine } from "./types.js";

export const archiveEngine: Engine = async ({ buffer, buffers = [], params }) => {
  const action = params?.action as string;
  switch (action) {
    case "zip": {
      const zip = new JSZip();
      buffers.forEach((item, index) => {
        zip.file(`file-${index + 1}.bin`, item);
      });
      const output = await zip.generateAsync({ type: "nodebuffer" });
      return { buffer: output, mimeType: "application/zip" };
    }
    case "unzip":
    case "extract": {
      if (!buffer) throw new Error("Archive buffer required");
      const zip = await JSZip.loadAsync(buffer);
      const files = Object.keys(zip.files);
      return { text: JSON.stringify({ files }) };
    }
    case "list": {
      if (!buffer) throw new Error("Archive buffer required");
      const zip = await JSZip.loadAsync(buffer);
      const files = Object.keys(zip.files);
      return { text: files.join("\n") };
    }
    default:
      return { buffer };
  }
};
