import { NextRequest } from "next/server";
import { prisma } from "@omni/db";

export const GET = (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");
  if (!jobId) {
    return new Response("Missing jobId", { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let active = true;

      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      while (active) {
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) {
          send({ error: "Job not found" });
          break;
        }
        send({
          status: job.status,
          progress: job.progress,
          stage: job.stage,
          outputKey: job.outputKey,
          outputText: job.outputText
        });
        if (["completed", "failed", "expired", "cancelled"].includes(job.status)) {
          active = false;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  });
};
