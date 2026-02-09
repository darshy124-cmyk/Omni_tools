import { describe, it, expect } from "vitest";
import { videoEngine } from "../src/videoEngine.js";

describe("videoEngine", () => {
  it("returns buffer", async () => {
    const result = await videoEngine({ buffer: Buffer.from("test"), params: { action: "compress" } });
    expect(result.buffer).toBeInstanceOf(Buffer);
  });
});
