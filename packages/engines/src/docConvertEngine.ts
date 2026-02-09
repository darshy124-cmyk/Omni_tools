import { Engine } from "./types.js";
import mammoth from "mammoth";
import { marked } from "marked";
import { PDFDocument, StandardFonts } from "pdf-lib";

const textToPdf = async (value: string) => {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const lines = value.split(/\r?\n/);
  let y = 760;
  for (const line of lines) {
    page.drawText(line, { x: 40, y, size: fontSize, font });
    y -= 16;
    if (y < 40) break;
  }
  const bytes = await pdf.save();
  return Buffer.from(bytes);
};

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export const docConvertEngine: Engine = async ({ buffer, text, params }) => {
  const action = params?.action as string;
  if (action?.startsWith("docx") && buffer) {
    const result = await mammoth.extractRawText({ buffer });
    if (action === "docx-to-html") {
      return { text: result.value };
    }
    if (action === "docx-to-txt") {
      return { text: result.value };
    }
    if (action === "docx-to-pdf") {
      const pdfBuffer = await textToPdf(result.value);
      return { buffer: pdfBuffer, mimeType: "application/pdf" };
    }
  }

  if (action === "markdown-to-html" && text) {
    return { text: marked(text) };
  }

  if (action === "markdown-to-pdf" && text) {
    const pdfBuffer = await textToPdf(stripHtml(marked(text)));
    return { buffer: pdfBuffer, mimeType: "application/pdf" };
  }

  if (action === "html-to-pdf" && text) {
    const pdfBuffer = await textToPdf(stripHtml(text));
    return { buffer: pdfBuffer, mimeType: "application/pdf" };
  }

  if (action === "txt-to-pdf" && text) {
    const pdfBuffer = await textToPdf(text);
    return { buffer: pdfBuffer, mimeType: "application/pdf" };
  }

  return { text: text || "" };
};
