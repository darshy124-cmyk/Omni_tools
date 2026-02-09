import { describe, it, expect } from "vitest";
import { audioEngine } from "../src/audioEngine.js";

describe("audioEngine", () => {
  it("returns buffer", async () => {
    const result = await audioEngine({ buffer: Buffer.from("test"), params: { action: "compress" } });
    expect(result.buffer).toBeInstanceOf(Buffer);
  });
});
