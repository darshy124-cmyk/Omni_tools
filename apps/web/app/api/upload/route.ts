import { NextRequest, NextResponse } from "next/server";
import { generateKey, putObject, signGetUrl } from "@omni/storage";
import { validateFile } from "../../../lib/fileValidation";

export const POST = async (request: NextRequest) => {
  const { filename, base64, contentType, maxBytes } = await request.json();
  if (!base64) {
    return NextResponse.json({ error: "Missing file payload" }, { status: 400 });
  }
  const buffer = Buffer.from(base64, "base64");
  const validation = validateFile(
    buffer,
    maxBytes || 25 * 1024 * 1024,
    filename,
    contentType
  );
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const key = generateKey("uploads");
  await putObject(key, buffer, contentType);
  const url = await signGetUrl(key);
  return NextResponse.json({ key, filename, url });
};
