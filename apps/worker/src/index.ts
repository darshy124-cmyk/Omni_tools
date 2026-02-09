import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import {
  textEngine,
  aiTextEngine,
  imageEngine,
  pdfEngine,
  archiveEngine,
  videoEngine,
  audioEngine,
  docConvertEngine,
  ocrEngine,
  urlEngine
} from "@omni/engines";
import { prisma } from "@omni/db";
import { getObject, putObject, deleteObject, generateKey } from "@omni/storage";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379");

export const queue = new Queue("jobs", { connection });

const engines: Record<string, (input: any) => Promise<any>> = {
  textEngine,
  aiTextEngine,
  imageEngine,
  pdfEngine,
  archiveEngine,
  videoEngine,
  audioEngine,
  docConvertEngine,
  ocrEngine,
  urlEngine
};

const streamToBuffer = async (stream: any) => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

new Worker(
  "jobs",
  async (job) => {
    const { engineKey, payload } = job.data as {
      engineKey: string;
      payload: any;
      jobId: string;
      inputKey?: string | null;
      inputKeys?: string[] | null;
      inputText?: string | null;
    };
    const engine = engines[engineKey];
    if (!engine) {
      throw new Error(`Engine ${engineKey} not found`);
    }
    try {
      await prisma.job.update({
        where: { id: job.data.jobId },
        data: { status: "processing", stage: "processing", progress: 20 }
      });

      const inputPayload: any = { params: payload.params };
      if (job.data.inputKeys && job.data.inputKeys.length > 0) {
        const buffers: Buffer[] = [];
        for (const key of job.data.inputKeys) {
          const stream = await getObject(key);
          const buffer = await streamToBuffer(stream);
          buffers.push(buffer);
        }
        inputPayload.buffers = buffers;
        inputPayload.buffer = buffers[0];
      } else if (job.data.inputKey) {
        const stream = await getObject(job.data.inputKey);
        const buffer = await streamToBuffer(stream);
        inputPayload.buffer = buffer;
        inputPayload.buffers = [buffer];
      } else if (job.data.inputText) {
        inputPayload.text = job.data.inputText;
      }

      const result = await engine(inputPayload);
      const outputKey = result.buffer ? generateKey("outputs") : null;
      if (result.buffer && outputKey) {
        await putObject(outputKey, result.buffer, result.mimeType);
      }

      await prisma.job.update({
        where: { id: job.data.jobId },
        data: {
          status: "completed",
          stage: "done",
          progress: 100,
          outputKey,
          outputText: result.text || null
        }
      });
      return result;
    } catch (error: any) {
      await prisma.job.update({
        where: { id: job.data.jobId },
        data: {
          status: "failed",
          stage: "error",
          progress: 100,
          error: error?.message || "Job failed"
        }
      });
      throw error;
    }
  },
  { connection }
);

const cleanupExpired = async () => {
  const now = new Date();
  const expiredJobs = await prisma.job.findMany({
    where: { expiresAt: { lt: now }, status: { notIn: ["expired"] } }
  });
  for (const job of expiredJobs) {
    if (job.inputKey) await deleteObject(job.inputKey);
    if (job.inputKeys && job.inputKeys.length > 0) {
      for (const key of job.inputKeys) {
        await deleteObject(key);
      }
    }
    if (job.outputKey) await deleteObject(job.outputKey);
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "expired", stage: "error", progress: 100 }
    });
  }
};

setInterval(() => {
  cleanupExpired().catch((error) => console.error("cleanup failed", error));
}, 5 * 60 * 1000);

console.log("Worker started");
