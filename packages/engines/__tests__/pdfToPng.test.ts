import { describe, it, expect } from "vitest";
import { pdfEngine } from "../src/pdfEngine.js";
import { PDFDocument } from "pdf-lib";

describe("pdfEngine pdf-to-png", () => {
  it("renders png", async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    const buffer = Buffer.from(await doc.save());
    const result = await pdfEngine({ buffer, params: { action: "pdf-to-png" } });
    expect(result.buffer).toBeInstanceOf(Buffer);
  });
});
