import { NextRequest } from "next/server";

export const GET = (request: NextRequest) => {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let progress = 0;
      const timer = setInterval(() => {
        progress += 20;
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ progress })}\n\n`)
        );
        if (progress >= 100) {
          clearInterval(timer);
          controller.close();
        }
      }, 300);
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
