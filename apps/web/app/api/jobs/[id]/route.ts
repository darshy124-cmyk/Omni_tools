import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@omni/db";
import { signGetUrl } from "@omni/storage";

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  const outputUrl = job.outputKey ? await signGetUrl(job.outputKey) : null;
  return NextResponse.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    stage: job.stage,
    outputKey: job.outputKey,
    outputUrl,
    outputText: job.outputText
  });
};
