import { describe, it, expect } from "vitest";
import { archiveEngine } from "../src/archiveEngine.js";

describe("archiveEngine", () => {
  it("zips buffers", async () => {
    const result = await archiveEngine({ buffers: [Buffer.from("a")], params: { action: "zip" } });
    expect(result.buffer).toBeInstanceOf(Buffer);
  });
});
