import { describe, it, expect } from "vitest";
import { docConvertEngine } from "../src/docConvertEngine.js";

describe("docConvertEngine", () => {
  it("converts markdown to html", async () => {
    const result = await docConvertEngine({ text: "# Hi", params: { action: "markdown-to-html" } });
    expect(result.text).toContain("<h1");
  });
});
