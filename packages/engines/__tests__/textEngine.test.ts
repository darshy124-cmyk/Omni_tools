import { describe, it, expect } from "vitest";
import { textEngine } from "../src/textEngine.js";

describe("textEngine", () => {
  it("uppercases", async () => {
    const result = await textEngine({ text: "hi", params: { action: "uppercase" } });
    expect(result.text).toBe("HI");
  });
});
