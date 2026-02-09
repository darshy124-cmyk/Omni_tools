import { describe, it, expect } from "vitest";
import { imageEngine } from "../src/imageEngine.js";
import sharp from "sharp";

describe("imageEngine compress", () => {
  it("compresses image", async () => {
    const buffer = await sharp({ create: { width: 50, height: 50, channels: 3, background: "blue" } })
      .png()
      .toBuffer();
    const result = await imageEngine({ buffer, params: { action: "compress" } });
    expect(result.buffer).toBeInstanceOf(Buffer);
  });
});
