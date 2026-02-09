import { describe, it, expect } from "vitest";
import { pdfEngine } from "../src/pdfEngine.js";
import { PDFDocument } from "pdf-lib";

describe("pdfEngine rotate", () => {
  it("rotates pdf", async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    const buffer = Buffer.from(await doc.save());
    const result = await pdfEngine({ buffer, params: { action: "rotate" } });
    expect(result.buffer).toBeInstanceOf(Buffer);
  });
});
