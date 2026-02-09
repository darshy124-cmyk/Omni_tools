import { NextResponse } from "next/server";
import { listTools } from "@omni/core";

export const GET = async () => {
  return NextResponse.json({ tools: listTools() });
};
