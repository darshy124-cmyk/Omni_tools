import { describe, it, expect } from "vitest";
import { imageEngine } from "../src/imageEngine.js";
import sharp from "sharp";

describe("imageEngine", () => {
  it("resizes image", async () => {
    const buffer = await sharp({ create: { width: 50, height: 50, channels: 3, background: "red" } })
      .png()
      .toBuffer();
    const result = await imageEngine({ buffer, params: { action: "resize" } });
    expect(result.buffer).toBeInstanceOf(Buffer);
  });
});
