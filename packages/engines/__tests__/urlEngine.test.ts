import { describe, it, expect } from "vitest";
import { urlEngine } from "../src/urlEngine.js";

describe("urlEngine", () => {
  it("returns headers", async () => {
    const result = await urlEngine({
      text: "https://example.com",
      params: { action: "headers" }
    });
    expect(result.text).toContain("headers");
  });
});
