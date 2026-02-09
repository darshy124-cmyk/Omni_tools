import { describe, it, expect } from "vitest";
import { pdfEngine } from "../src/pdfEngine.js";
import { PDFDocument } from "pdf-lib";

describe("pdfEngine", () => {
  it("merges PDFs", async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    const buffer = Buffer.from(await doc.save());
    const result = await pdfEngine({ buffers: [buffer, buffer], params: { action: "merge" } });
    expect(result.buffer).toBeInstanceOf(Buffer);
  });
});
