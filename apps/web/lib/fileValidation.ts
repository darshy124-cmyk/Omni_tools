const signatures: Record<string, number[]> = {
  pdf: [0x25, 0x50, 0x44, 0x46],
  png: [0x89, 0x50, 0x4e, 0x47],
  jpg: [0xff, 0xd8, 0xff],
  gif: [0x47, 0x49, 0x46],
  mp3: [0x49, 0x44, 0x33],
  mp4: [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70],
  zip: [0x50, 0x4b, 0x03, 0x04]
};

const allowedExtensions = new Set([
  "docx",
  "txt",
  "md",
  "markdown",
  "html",
  "htm",
  "csv",
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "mp3",
  "mp4",
  "zip"
]);

const isMostlyText = (buffer: Buffer) => {
  const sample = buffer.subarray(0, 512);
  let printable = 0;
  for (const byte of sample) {
    if (byte === 9 || byte === 10 || byte === 13) {
      printable += 1;
    } else if (byte >= 32 && byte <= 126) {
      printable += 1;
    }
  }
  return sample.length > 0 && printable / sample.length > 0.85;
};

export const validateFile = (
  buffer: Buffer,
  maxBytes: number,
  filename?: string,
  contentType?: string
) => {
  if (buffer.length > maxBytes) {
    return { ok: false, error: "File too large" };
  }
  const match = Object.values(signatures).some((sig) =>
    sig.every((byte, idx) => buffer[idx] === byte)
  );
  if (!match && !isMostlyText(buffer)) {
    return { ok: false, error: "Unsupported file type" };
  }
  if (filename) {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.has(ext)) {
      return { ok: false, error: "Unsupported file extension" };
    }
  }
  if (contentType && !contentType.startsWith("application") && !contentType.startsWith("image") && !contentType.startsWith("audio") && !contentType.startsWith("video")) {
    return { ok: false, error: "Unsupported MIME type" };
  }
  return { ok: true };
};
