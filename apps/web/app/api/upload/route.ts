import { NextRequest, NextResponse } from "next/server";
import { generateKey } from "@omni/storage";

export const POST = async (request: NextRequest) => {
  const { filename } = await request.json();
  const key = generateKey("uploads");
  return NextResponse.json({ key, filename });
};
