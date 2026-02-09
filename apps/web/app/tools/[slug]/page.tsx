"use client";

import { useState } from "react";
import { getToolBySlug } from "@omni/core";
import { notFound } from "next/navigation";

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = getToolBySlug(params.slug);
  const [text, setText] = useState("");
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileBase64s, setFileBase64s] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [filenames, setFilenames] = useState<string[]>([]);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!tool) return notFound();

  const toBase64 = async (file: File) => {
    const data = await file.arrayBuffer();
    const bytes = new Uint8Array(data);
    let binary = "";
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    return btoa(binary);
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setFileBase64(await toBase64(file));
    setFilenames([file.name]);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const values: string[] = [];
    const names: string[] = [];
    for (const file of Array.from(files)) {
      values.push(await toBase64(file));
      names.push(file.name);
    }
    setFileBase64s(values);
    setFilenames(names);
  };

  const runJob = async () => {
    setError(null);
    setResult(null);
    setOutputUrl(null);
    const payload: any = { slug: tool.slug };
    if (tool.kind === "text") payload.text = text;
    if (tool.kind === "url") payload.url = text;
    if (tool.kind === "multiFile") {
      payload.base64s = fileBase64s;
      payload.filenames = filenames;
    }
    if (tool.kind !== "text" && tool.kind !== "url" && tool.kind !== "multiFile") {
      payload.base64 = fileBase64;
      payload.filename = filenames[0];
    }
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Failed to start job");
      return;
    }
    setJobId(data.id);
    setResult(`Job queued: ${data.id}`);
    const poll = async () => {
      const response = await fetch(`/api/jobs/${data.id}`);
      if (!response.ok) return;
      const job = await response.json();
      if (job.outputText) setResult(job.outputText);
      if (job.outputUrl) setOutputUrl(job.outputUrl);
      if (["completed", "failed", "expired", "cancelled"].includes(job.status)) {
        return;
      }
      setTimeout(poll, 2000);
    };
    poll();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{tool.name}</h1>
        <p className="mt-2 text-gray-600">{tool.description}</p>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <div className="text-sm text-gray-500">Category</div>
        <div className="mt-1 text-lg font-semibold">{tool.category}</div>
        <div className="mt-4 grid gap-2 text-sm text-gray-600">
          <div>Kind: {tool.kind}</div>
          <div>Tier: {tool.tier}</div>
          <div>Engine: {tool.runner.engineKey}</div>
        </div>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <div className="text-lg font-semibold">Run tool</div>
        {(tool.kind === "text" || tool.kind === "url") && (
          <textarea
            className="mt-3 w-full rounded border p-2"
            rows={6}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        )}
        {tool.kind !== "text" && tool.kind !== "url" && tool.kind !== "multiFile" && (
          <input
            className="mt-3 w-full"
            type="file"
            onChange={(event) => handleFile(event.target.files?.[0] || null)}
          />
        )}
        {tool.kind === "multiFile" && (
          <input
            className="mt-3 w-full"
            type="file"
            multiple
            onChange={(event) => handleFiles(event.target.files)}
          />
        )}
        <button
          className="mt-4 rounded bg-black px-4 py-2 text-white"
          onClick={runJob}
        >
          Run
        </button>
        {error && <div className="mt-3 text-sm text-red-500">{error}</div>}
        {result && <div className="mt-3 text-sm text-gray-700">{result}</div>}
        {outputUrl && (
          <a
            className="mt-3 inline-flex text-sm text-indigo-600 hover:underline"
            href={outputUrl}
          >
            Download output
          </a>
        )}
        {jobId && (
          <div className="mt-3 text-sm text-gray-500">
            Stream progress at <code>/api/stream?jobId={jobId}</code>
          </div>
        )}
      </div>
    </div>
  );
}
