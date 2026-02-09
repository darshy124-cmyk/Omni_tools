import sharp from "sharp";
import { Engine } from "./types.js";

export const imageEngine: Engine = async ({ buffer, params }) => {
  if (!buffer) throw new Error("Image buffer required");
  const action = params?.action as string;
  let image = sharp(buffer);

  switch (action) {
    case "resize":
      image = image.resize({ width: 800, height: 800, fit: "inside" });
      break;
    case "crop":
      image = image.resize({ width: 600, height: 600, fit: "cover" });
      break;
    case "rotate":
      image = image.rotate(90);
      break;
    case "flip":
      image = image.flip();
      break;
    case "format":
      image = image.png();
      break;
    case "compress":
      image = image.jpeg({ quality: 70 });
      break;
    case "grayscale":
      image = image.grayscale();
      break;
    case "blur":
      image = image.blur(5);
      break;
    case "sharpen":
      image = image.sharpen();
      break;
    case "watermark": {
      const svg = Buffer.from(
        `<svg width="200" height="40"><text x="0" y="25" font-size="24" fill="white">OmniTool</text></svg>`
      );
      image = image.composite([{ input: svg, gravity: "southeast" }]);
      break;
    }
    default:
      break;
  }

  const output = await image.toBuffer();
  return { buffer: output, mimeType: "image/png" };
};
