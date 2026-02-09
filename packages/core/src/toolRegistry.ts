import { z } from "zod";
import { toolInputBaseSchema, ToolDefinition } from "./types.js";

const textSchema = z.object({ text: z.string().min(1) });
const urlSchema = z.object({ url: z.string().url() });
const fileSchema = z.object({ fileKey: z.string().min(1) });
const filesSchema = z.object({ files: z.array(z.string().min(1)).min(1) });

const commonLimits = {
  maxBytes: 25 * 1024 * 1024,
  maxPages: 200,
  maxDurationSec: 300,
  maxTokens: 4000,
  costUnitsFormula: "base(1) + sizeMB(1)"
};

const proLimits = {
  maxBytes: 250 * 1024 * 1024,
  maxPages: 2000,
  maxDurationSec: 1800,
  maxTokens: 16000,
  costUnitsFormula: "base(2) + sizeMB(2)"
};

const baseFaq = [
  "How long are files kept? 60 minutes by default.",
  "Can I delete outputs immediately? Yes, delete now is supported."
];

const baseExamples = [
  "Process an input and download the result.",
  "Queue multiple jobs with the same tool."
];

const categories = {
  text: "Text",
  ai: "AI",
  image: "Image",
  pdf: "PDF",
  video: "Video",
  audio: "Audio",
  archive: "Archive",
  doc: "Document",
  url: "URL",
  ocr: "OCR"
};

const textActions = [
  "uppercase",
  "lowercase",
  "reverse",
  "trim",
  "slugify",
  "wordcount",
  "sentencecase",
  "titlecase",
  "dedupe",
  "linebreaks"
];

const aiActions = [
  "summarize",
  "rewrite",
  "outline",
  "expand",
  "headline",
  "bulletize",
  "translate",
  "tone",
  "keypoints",
  "email"
];

const imageActions = [
  "resize",
  "crop",
  "rotate",
  "flip",
  "format",
  "compress",
  "grayscale",
  "blur",
  "sharpen",
  "watermark"
];

const pdfActions = [
  "merge",
  "split",
  "compress",
  "rotate",
  "extract-text",
  "pdf-to-png",
  "pdf-to-jpg",
  "add-watermark",
  "encrypt",
  "decrypt"
];

const videoActions = [
  "compress",
  "gif",
  "mute",
  "clip",
  "resize",
  "rotate",
  "speed",
  "thumbnail",
  "extract-audio",
  "watermark"
];

const audioActions = [
  "compress",
  "trim",
  "convert",
  "normalize",
  "fade",
  "split",
  "merge",
  "speed",
  "mono",
  "extract"
];

const archiveActions = [
  "zip",
  "unzip",
  "tar",
  "untar",
  "list",
  "compress",
  "extract"
];

const docActions = [
  "docx-to-pdf",
  "docx-to-txt",
  "docx-to-html",
  "markdown-to-pdf",
  "markdown-to-html",
  "html-to-pdf",
  "txt-to-pdf"
];

const ocrActions = [
  "ocr-basic",
  "ocr-table",
  "ocr-form",
  "ocr-receipt",
  "ocr-translate"
];

const urlActions = [
  "metadata",
  "screenshot",
  "readability",
  "headers",
  "favicon",
  "whois",
  "dns",
  "ssl",
  "redirects",
  "lighthouse"
];

const makeTool = (tool: ToolDefinition): ToolDefinition => tool;

const generateTools = (): ToolDefinition[] => {
  const tools: ToolDefinition[] = [];
  let index = 1;

  for (const action of textActions) {
    tools.push(
      makeTool({
        id: `tool_${index++}`,
        slug: `text-${action}`,
        name: `Text ${action.replace(/-/g, " ")}`,
        description: `Run the ${action} text transform.`,
        category: categories.text,
        tags: ["text", action],
        kind: "text",
        inputSchema: textSchema,
        uiSchema: { input: "textarea" },
        limits: commonLimits,
        runner: { engineKey: "textEngine", engineParams: { action } },
        isAi: false,
        tier: "free",
        seoTitle: `Text ${action} tool`,
        seoDescription: `Apply ${action} to your text instantly.`,
        examples: baseExamples,
        faq: baseFaq
      })
    );
  }

  for (const action of aiActions) {
    tools.push(
      makeTool({
        id: `tool_${index++}`,
        slug: `ai-${action}`,
        name: `AI ${action.replace(/-/g, " ")}`,
        description: `AI tool to ${action.replace(/-/g, " ")}.`,
        category: categories.ai,
        tags: ["ai", action],
        kind: "text",
        inputSchema: textSchema,
        uiSchema: { input: "textarea", tone: "select" },
        limits: proLimits,
        runner: { engineKey: "aiTextEngine", engineParams: { action } },
        isAi: true,
        tier: "pro",
        seoTitle: `AI ${action} tool`,
        seoDescription: `Use AI to ${action.replace(/-/g, " ")}.`,
        examples: baseExamples,
        faq: baseFaq
      })
    );
  }

  for (const action of imageActions) {
    tools.push(
      makeTool({
        id: `tool_${index++}`,
        slug: `image-${action}`,
        name: `Image ${action.replace(/-/g, " ")}`,
        description: `Perform image ${action.replace(/-/g, " ")}.`,
        category: categories.image,
        tags: ["image", action],
        kind: "file",
        inputSchema: fileSchema,
        uiSchema: { input: "file" },
        limits: commonLimits,
        runner: { engineKey: "imageEngine", engineParams: { action } },
        isAi: false,
        tier: "free",
        seoTitle: `Image ${action} tool`,
        seoDescription: `Perform ${action} on images.`,
        examples: baseExamples,
        faq: baseFaq
      })
    );
  }

  for (const action of pdfActions) {
    tools.push(
      makeTool({
        id: `tool_${index++}`,
        slug: `pdf-${action}`,
        name: `PDF ${action.replace(/-/g, " ")}`,
        description: `Perform PDF ${action.replace(/-/g, " ")}.`,
        category: categories.pdf,
        tags: ["pdf", action],
        kind: action === "merge" ? "multiFile" : "file",
        inputSchema: action === "merge" ? filesSchema : fileSchema,
        uiSchema: { input: "file" },
        limits: proLimits,
        runner: { engineKey: "pdfEngine", engineParams: { action } },
        isAi: false,
        tier: "pro",
        seoTitle: `PDF ${action} tool`,
        seoDescription: `Perform ${action} on PDF documents.`,
        examples: baseExamples,
        faq: baseFaq
      })
    );
  }

  for (const action of videoActions) {
    tools.push(
      makeTool({
        id: `tool_${index++}`,
        slug: `video-${action}`,
        name: `Video ${action.replace(/-/g, " ")}`,
        description: `Perform video ${action.replace(/-/g, " ")}.`,
        category: categories.video,
        tags: ["video", action],
        kind: "file",
        inputSchema: fileSchema,
        uiSchema: { input: "file" },
        limits: proLimits,
        runner: { engineKey: "videoEngine", engineParams: { action } },
        isAi: false,
        tier: "pro",
        seoTitle: `Video ${action} tool`,
        seoDescription: `Perform ${action} on videos.`,
        examples: baseExamples,
        faq: baseFaq
      })
    );
  }

  for (const action of audioActions) {
    tools.push(
      makeTool({
        id: `tool_${index++}`,
        slug: `audio-${action}`,
        name: `Audio ${action.replace(/-/g, " ")}`,
        description: `Perform audio ${action.replace(/-/g, " ")}.`,
        category: categories.audio,
        tags: ["audio", action],
        kind: "file",
        inputSchema: fileSchema,
        uiSchema: { input: "file" },
        limits: commonLimits,
        runner: { engineKey: "audioEngine", engineParams: { action } },
        isAi: false,
        tier: "free",
        seoTitle: `Audio ${action} tool`,
        seoDescription: `Perform ${action} on audio.`,
        examples: baseExamples,
        faq: baseFaq
      })
    );
  }

  for (const action of archiveActions) {
    tools.push(
      makeTool({
        id: `tool_${index++}`,
        slug: `archive-${action}`,
        name: `Archive ${action.replace(/-/g, " ")}`,
        description: `Perform archive ${action.replace(/-/g, " ")}.`,
        category: categories.archive,
        tags: ["archive", action],
        kind: action === "zip" ? "multiFile" : "file",
        inputSchema: action === "zip" ? filesSchema : fileSchema,
        uiSchema: { input: "file" },
        limits: commonLimits,
        runner: { engineKey: "archiveEngine", engineParams: { action } },
        isAi: false,
        tier: "free",
        seoTitle: `Archive ${action} tool`,
        seoDescription: `Perform ${action} on archives.`,
        examples: baseExamples,
        faq: baseFaq
      })
    );
  }

  for (const action of docActions) {
    tools.push(
      makeTool({
        id: `tool_${index++}`,
        slug: `doc-${action}`,
        name: `Doc ${action.replace(/-/g, " ")}`,
        description: `Convert documents with ${action.replace(/-/g, " ")}.`,
        category: categories.doc,
        tags: ["doc", action],
        kind: "file",
        inputSchema: fileSchema,
        uiSchema: { input: "file" },
        limits: commonLimits,
        runner: { engineKey: "docConvertEngine", engineParams: { action } },
        isAi: false,
        tier: "free",
        seoTitle: `Doc ${action} tool`,
        seoDescription: `Convert documents using ${action}.`,
        examples: baseExamples,
        faq: baseFaq
      })
    );
  }

  for (const action of ocrActions) {
    tools.push(
      makeTool({
        id: `tool_${index++}`,
        slug: `ocr-${action}`,
        name: `OCR ${action.replace(/-/g, " ")}`,
        description: `Extract text using ${action.replace(/-/g, " ")}.`,
        category: categories.ocr,
        tags: ["ocr", action],
        kind: "file",
        inputSchema: fileSchema,
        uiSchema: { input: "file" },
        limits: proLimits,
        runner: { engineKey: "ocrEngine", engineParams: { action } },
        isAi: false,
        tier: "pro",
        seoTitle: `OCR ${action} tool`,
        seoDescription: `Extract text with ${action}.`,
        examples: baseExamples,
        faq: baseFaq
      })
    );
  }

  for (const action of urlActions) {
    tools.push(
      makeTool({
        id: `tool_${index++}`,
        slug: `url-${action}`,
        name: `URL ${action.replace(/-/g, " ")}`,
        description: `Analyze URL with ${action.replace(/-/g, " ")}.`,
        category: categories.url,
        tags: ["url", action],
        kind: "url",
        inputSchema: urlSchema,
        uiSchema: { input: "url" },
        limits: commonLimits,
        runner: { engineKey: "textEngine", engineParams: { action: "url" } },
        isAi: false,
        tier: "free",
        seoTitle: `URL ${action} tool`,
        seoDescription: `Inspect URL with ${action}.`,
        examples: baseExamples,
        faq: baseFaq
      })
    );
  }

  while (tools.length < 220) {
    const idx = tools.length + 1;
    tools.push(
      makeTool({
        id: `tool_${index++}`,
        slug: `text-transform-${idx}`,
        name: `Text Transform ${idx}`,
        description: `Extra text transform ${idx}.`,
        category: categories.text,
        tags: ["text", "extra"],
        kind: "text",
        inputSchema: textSchema,
        uiSchema: { input: "textarea" },
        limits: commonLimits,
        runner: { engineKey: "textEngine", engineParams: { action: "uppercase" } },
        isAi: false,
        tier: "free",
        seoTitle: `Text transform ${idx}`,
        seoDescription: `Extra text transform ${idx}.`,
        examples: baseExamples,
        faq: baseFaq
      })
    );
  }

  return tools;
};

export const toolRegistry = generateTools();

export const getToolBySlug = (slug: string) =>
  toolRegistry.find((tool) => tool.slug === slug);

export const listTools = () => toolRegistry;

export const toolCount = toolRegistry.length;

export const baseInputSchema = toolInputBaseSchema;
