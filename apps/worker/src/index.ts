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
  ocrEngine
} from "@omni/engines";

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
  ocrEngine
};

new Worker(
  "jobs",
  async (job) => {
    const { engineKey, payload } = job.data as {
      engineKey: string;
      payload: any;
    };
    const engine = engines[engineKey];
    if (!engine) {
      throw new Error(`Engine ${engineKey} not found`);
    }
    return engine(payload);
  },
  { connection }
);

console.log("Worker started");
