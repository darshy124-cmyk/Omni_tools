import { Engine } from "./types.js";
import dns from "node:dns/promises";
import net from "node:net";
import tls from "node:tls";
import { chromium } from "playwright";

const isPrivateIp = (ip: string) => {
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    if (parts[0] === 10) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
  }
  if (net.isIPv6(ip)) {
    return (
      ip.startsWith("fc") ||
      ip.startsWith("fd") ||
      ip === "::1" ||
      ip.startsWith("fe80")
    );
  }
  return false;
};

const assertSafeUrl = async (url: URL) => {
  if (url.hostname === "localhost" || url.hostname.endsWith(".local")) {
    throw new Error("Blocked hostname");
  }
  const records = await dns.lookup(url.hostname, { all: true });
  for (const record of records) {
    if (isPrivateIp(record.address)) {
      throw new Error("Blocked IP range");
    }
  }
};

const fetchWithTimeout = async (url: string, timeoutMs = 8000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal, redirect: "follow" });
  } finally {
    clearTimeout(timeout);
  }
};

const extractMetadata = (html: string) => {
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const descMatch = html.match(
    /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i
  );
  return {
    title: titleMatch?.[1] ?? "",
    description: descMatch?.[1] ?? ""
  };
};

export const urlEngine: Engine = async ({ text, params }) => {
  const action = params?.action as string;
  if (!text) throw new Error("URL required");
  const url = new URL(text);
  await assertSafeUrl(url);

  if (action === "headers") {
    const response = await fetchWithTimeout(url.toString());
    const headers = Object.fromEntries(response.headers.entries());
    return { text: JSON.stringify({ status: response.status, headers }, null, 2) };
  }

  if (action === "metadata" || action === "readability") {
    const response = await fetchWithTimeout(url.toString());
    const html = await response.text();
    if (action === "metadata") {
      const metadata = extractMetadata(html);
      return { text: JSON.stringify(metadata, null, 2) };
    }
    const bodyText = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return { text: bodyText.slice(0, 4000) };
  }

  if (action === "favicon") {
    return { text: `${url.origin}/favicon.ico` };
  }

  if (action === "dns") {
    const records = await dns.lookup(url.hostname, { all: true });
    return { text: JSON.stringify(records, null, 2) };
  }

  if (action === "ssl") {
    const cert = await new Promise<tls.PeerCertificate>((resolve, reject) => {
      const socket = tls.connect(
        {
          host: url.hostname,
          port: 443,
          servername: url.hostname
        },
        () => {
          const certificate = socket.getPeerCertificate();
          socket.end();
          resolve(certificate);
        }
      );
      socket.on("error", reject);
    });
    return { text: JSON.stringify(cert, null, 2) };
  }

  if (action === "redirects") {
    const response = await fetchWithTimeout(url.toString());
    return {
      text: JSON.stringify(
        { finalUrl: response.url, status: response.status },
        null,
        2
      )
    };
  }

  if (action === "lighthouse") {
    const start = Date.now();
    const response = await fetchWithTimeout(url.toString());
    const html = await response.text();
    const durationMs = Date.now() - start;
    return {
      text: JSON.stringify(
        { status: response.status, durationMs, bytes: html.length },
        null,
        2
      )
    };
  }

  if (action === "whois") {
    const response = await new Promise<string>((resolve, reject) => {
      const socket = net.createConnection(43, "whois.iana.org", () => {
        socket.write(`${url.hostname}\r\n`);
      });
      let data = "";
      socket.on("data", (chunk) => {
        data += chunk.toString();
      });
      socket.on("end", () => resolve(data));
      socket.on("error", reject);
    });
    return { text: response };
  }

  if (action === "screenshot") {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.goto(url.toString(), { waitUntil: "networkidle" });
    const buffer = await page.screenshot({ type: "png", fullPage: true });
    await browser.close();
    return { buffer, mimeType: "image/png" };
  }

  return { text: "" };
};
