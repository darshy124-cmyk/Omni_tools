import { describe, it, expect } from "vitest";
import { aiTextEngine } from "../src/aiTextEngine.js";

process.env.AI_PROVIDER = "mock";

describe("aiTextEngine", () => {
  it("returns deterministic mock", async () => {
    const result = await aiTextEngine({ text: "hello", params: { action: "summarize" } });
    expect(result.text?.startsWith("MOCK-SUMMARIZE")).toBe(true);
  });
});
