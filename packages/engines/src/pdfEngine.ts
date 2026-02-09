import { PDFDocument, degrees } from "pdf-lib";
import { Engine } from "./types.js";
import crypto from "node:crypto";
import { createCanvas } from "canvas";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const renderPdfPage = async (buffer: Buffer) => {
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext("2d");
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toBuffer("image/png");
};

const encryptBuffer = (buffer: Buffer, password: string) => {
  const iv = crypto.randomBytes(12);
  const key = crypto.scryptSync(password, "omni", 32);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]);
};

const decryptBuffer = (buffer: Buffer, password: string) => {
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const data = buffer.subarray(28);
  const key = crypto.scryptSync(password, "omni", 32);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]);
};

export const pdfEngine: Engine = async ({ buffer, buffers = [], params }) => {
  const action = params?.action as string;
  if (!buffer && buffers.length === 0) {
    throw new Error("PDF buffer required");
  }

  switch (action) {
    case "merge": {
      const merged = await PDFDocument.create();
      for (const item of buffers) {
        const doc = await PDFDocument.load(item);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((page) => merged.addPage(page));
      }
      const output = await merged.save();
      return { buffer: Buffer.from(output), mimeType: "application/pdf" };
    }
    case "split": {
      if (!buffer) throw new Error("PDF buffer required");
      const doc = await PDFDocument.load(buffer);
      const pages = await doc.copyPages(doc, [0]);
      const newDoc = await PDFDocument.create();
      newDoc.addPage(pages[0]);
      const output = await newDoc.save();
      return { buffer: Buffer.from(output), mimeType: "application/pdf" };
    }
    case "extract-text": {
      if (!buffer) throw new Error("PDF buffer required");
      const doc = await PDFDocument.load(buffer);
      const pageCount = doc.getPageCount();
      return { text: `PDF pages: ${pageCount}` };
    }
    case "pdf-to-png": {
      if (!buffer) throw new Error("PDF buffer required");
      const png = await renderPdfPage(buffer);
      return { buffer: png, mimeType: "image/png" };
    }
    case "pdf-to-jpg": {
      if (!buffer) throw new Error("PDF buffer required");
      const png = await renderPdfPage(buffer);
      return { buffer: png, mimeType: "image/jpeg" };
    }
    case "rotate": {
      if (!buffer) throw new Error("PDF buffer required");
      const doc = await PDFDocument.load(buffer);
      doc.getPages().forEach((page) => page.setRotation(degrees(90)));
      const output = await doc.save();
      return { buffer: Buffer.from(output), mimeType: "application/pdf" };
    }
    case "compress": {
      if (!buffer) throw new Error("PDF buffer required");
      const doc = await PDFDocument.load(buffer);
      const output = await doc.save({ useObjectStreams: false });
      return { buffer: Buffer.from(output), mimeType: "application/pdf" };
    }
    case "add-watermark": {
      if (!buffer) throw new Error("PDF buffer required");
      const doc = await PDFDocument.load(buffer);
      doc.getPages().forEach((page) => {
        page.drawText("OmniTool", { x: 30, y: 30, size: 20 });
      });
      const output = await doc.save();
      return { buffer: Buffer.from(output), mimeType: "application/pdf" };
    }
    case "encrypt": {
      if (!buffer) throw new Error("PDF buffer required");
      const password = (params?.password as string) || "omni";
      const encrypted = encryptBuffer(buffer, password);
      return { buffer: encrypted, mimeType: "application/octet-stream" };
    }
    case "decrypt": {
      if (!buffer) throw new Error("PDF buffer required");
      const password = (params?.password as string) || "omni";
      const decrypted = decryptBuffer(buffer, password);
      return { buffer: decrypted, mimeType: "application/pdf" };
    }
    default:
      return { buffer };
  }
};
