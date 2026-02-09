import { z } from "zod";

export const toolInputBaseSchema = z.object({
  text: z.string().optional(),
  url: z.string().url().optional(),
  fileKey: z.string().optional(),
  files: z.array(z.string()).optional()
});

export type ToolKind = "text" | "file" | "multiFile" | "mixed" | "url";
export type ToolTier = "free" | "pro";

export type ToolDefinition = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  kind: ToolKind;
  inputSchema: z.ZodSchema;
  uiSchema: Record<string, unknown>;
  limits: {
    maxBytes: number;
    maxPages: number;
    maxDurationSec: number;
    maxTokens: number;
    costUnitsFormula: string;
  };
  runner: {
    engineKey: string;
    engineParams: Record<string, unknown>;
  };
  isAi: boolean;
  tier: ToolTier;
  seoTitle: string;
  seoDescription: string;
  examples: string[];
  faq: string[];
};

export const toolDefinitionSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  kind: z.enum(["text", "file", "multiFile", "mixed", "url"]),
  inputSchema: z.any(),
  uiSchema: z.record(z.unknown()),
  limits: z.object({
    maxBytes: z.number().int(),
    maxPages: z.number().int(),
    maxDurationSec: z.number().int(),
    maxTokens: z.number().int(),
    costUnitsFormula: z.string()
  }),
  runner: z.object({
    engineKey: z.string(),
    engineParams: z.record(z.unknown())
  }),
  isAi: z.boolean(),
  tier: z.enum(["free", "pro"]),
  seoTitle: z.string(),
  seoDescription: z.string(),
  examples: z.array(z.string()),
  faq: z.array(z.string())
});
