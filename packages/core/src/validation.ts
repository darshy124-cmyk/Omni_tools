import { toolDefinitionSchema } from "./types.js";
import { toolRegistry } from "./toolRegistry.js";

export const validateRegistry = () => {
  const seen = new Set<string>();
  for (const tool of toolRegistry) {
    toolDefinitionSchema.parse(tool);
    if (seen.has(tool.slug)) {
      throw new Error(`Duplicate tool slug: ${tool.slug}`);
    }
    seen.add(tool.slug);
  }
  return toolRegistry.length;
};
