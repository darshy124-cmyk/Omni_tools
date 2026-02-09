import { Engine } from "./types.js";
import mammoth from "mammoth";
import { marked } from "marked";

export const docConvertEngine: Engine = async ({ buffer, text, params }) => {
  const action = params?.action as string;
  if (action?.startsWith("docx") && buffer) {
    const result = await mammoth.extractRawText({ buffer });
    if (action === "docx-to-pdf") {
      return { text: result.value };
    }
    return { text: result.value };
  }

  if (action === "markdown-to-html" && text) {
    return { text: marked(text) };
  }

  if (action === "markdown-to-pdf" && text) {
    return { text: marked(text) };
  }

  if (action === "html-to-pdf" && text) {
    return { text };
  }

  if (action === "txt-to-pdf" && text) {
    return { text };
  }

  return { text: text || "" };
};
