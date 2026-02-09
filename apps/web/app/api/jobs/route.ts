import { NextRequest, NextResponse } from "next/server";
import { getToolBySlug } from "@omni/core";
import { prisma } from "@omni/db";
import { generateKey, putObject } from "@omni/storage";
import { rateLimit } from "../../../lib/rateLimit";
import { validateFile } from "../../../lib/fileValidation";
import { jobQueue } from "../../../lib/queue";

const calculateCostUnits = (formula: string, sizeBytes: number) => {
  const baseMatch = formula.match(/base\\((\\d+)\\)/);
  const sizeMatch = formula.match(/sizeMB\\((\\d+)\\)/);
  const base = baseMatch ? Number(baseMatch[1]) : 1;
  const perMb = sizeMatch ? Number(sizeMatch[1]) : 1;
  const sizeMb = Math.ceil(sizeBytes / (1024 * 1024));
  return base + perMb * sizeMb;
};

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const tool = getToolBySlug(body.slug);
  if (!tool) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }

  const forwarded = request.headers.get("x-forwarded-for") || "anonymous";
  const ip = forwarded.split(",")[0]?.trim() || "anonymous";
  const allowed = await rateLimit(`rate:${ip}`, 30, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const expiresAt = new Date(Date.now() + Number(process.env.TTL_MINUTES || 60) * 60000);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const planLimits =
    tool.tier === "pro"
      ? { jobs: 500, cost: 2000 }
      : { jobs: 30, cost: 50 };

  const usage = await prisma.usageLimit.upsert({
    where: {
      userId_day: { userId: ip, day: today }
    },
    update: {},
    create: { userId: ip, day: today, plan: tool.tier, jobsUsed: 0, costUsed: 0 }
  });

  if (usage.jobsUsed >= planLimits.jobs || usage.costUsed >= planLimits.cost) {
    return NextResponse.json({ error: "Usage limit exceeded" }, { status: 403 });
  }

  let inputKey: string | null = null;
  let inputKeys: string[] = [];
  let inputText: string | null = null;
  let inputSize = 0;
  if (tool.kind === "text" || tool.kind === "url") {
    inputText = body.text || body.url || "";
    inputSize = Buffer.byteLength(inputText);
  } else if (tool.kind === "multiFile" && Array.isArray(body.base64s)) {
    if (body.base64s.length === 0) {
      return NextResponse.json({ error: "Missing files" }, { status: 400 });
    }
    const buffers = body.base64s.map((value: string) => Buffer.from(value, "base64"));
    for (let index = 0; index < buffers.length; index += 1) {
      const buffer = buffers[index];
      const filename =
        Array.isArray(body.filenames) && body.filenames.length === buffers.length
          ? body.filenames[index]
          : undefined;
      const validation = validateFile(
        buffer,
        tool.limits.maxBytes,
        filename,
        body.contentType
      );
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      inputSize += buffer.length;
      const key = generateKey("inputs");
      await putObject(key, buffer, body.contentType);
      inputKeys.push(key);
    }
  } else if (body.base64) {
    const buffer = Buffer.from(body.base64, "base64");
    const validation = validateFile(
      buffer,
      tool.limits.maxBytes,
      body.filename,
      body.contentType
    );
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    inputSize = buffer.length;
    inputKey = generateKey("inputs");
    await putObject(inputKey, buffer, body.contentType);
  } else {
    return NextResponse.json({ error: "Missing input" }, { status: 400 });
  }

  const costUnits = calculateCostUnits(tool.limits.costUnitsFormula, inputSize);
  await prisma.usageLimit.update({
    where: { id: usage.id },
    data: { jobsUsed: usage.jobsUsed + 1, costUsed: usage.costUsed + costUnits }
  });

  const job = await prisma.job.create({
    data: {
      toolId: tool.id,
      status: "queued",
      progress: 0,
      stage: "queued",
      inputKey,
      inputText,
      inputKeys,
      expiresAt
    }
  });

  await jobQueue.add("execute", {
    jobId: job.id,
    engineKey: tool.runner.engineKey,
    payload: { params: tool.runner.engineParams },
    inputKey,
    inputKeys,
    inputText
  });

  return NextResponse.json({ id: job.id, status: job.status });
};
