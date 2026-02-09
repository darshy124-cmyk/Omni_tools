import { describe, it, expect } from "vitest";
import { validateRegistry, toolRegistry } from "../src/index.js";

describe("tool registry", () => {
  it("contains 200+ tools", () => {
    const count = validateRegistry();
    expect(count).toBeGreaterThanOrEqual(200);
  });

  it("all tools have unique slugs", () => {
    const slugs = new Set(toolRegistry.map((tool) => tool.slug));
    expect(slugs.size).toBe(toolRegistry.length);
  });
});
