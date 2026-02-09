import { NextRequest, NextResponse } from "next/server";
import { getToolBySlug } from "@omni/core";
import {
  textEngine,
  aiTextEngine,
  imageEngine,
  pdfEngine,
  archiveEngine,
  videoEngine,
  audioEngine,
  docConvertEngine,
  ocrEngine
} from "@omni/engines";

let jobCounter = 0;

const engineMap = {
  textEngine,
  aiTextEngine,
  imageEngine,
  pdfEngine,
  archiveEngine,
  videoEngine,
  audioEngine,
  docConvertEngine,
  ocrEngine
};

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const tool = getToolBySlug(body.slug);
  if (!tool) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }

  const engine = engineMap[tool.runner.engineKey];
  if (!engine) {
    return NextResponse.json({ error: "Engine not found" }, { status: 404 });
  }

  const payload: Record<string, unknown> = {
    params: tool.runner.engineParams
  };

  if (tool.kind === "text" || tool.kind === "url") {
    payload.text = body.text || body.url || "";
  } else if (body.base64) {
    payload.buffer = Buffer.from(body.base64, "base64");
    payload.buffers = [payload.buffer];
  }

  jobCounter += 1;
  const result = await engine(payload);

  return NextResponse.json({
    id: `job-${jobCounter}`,
    status: "completed",
    tool: tool.slug,
    result: result.text
      ? { text: result.text }
      : result.buffer
        ? { base64: result.buffer.toString("base64") }
        : {}
  });
};
