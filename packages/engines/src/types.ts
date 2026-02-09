export type EngineInput = {
  text?: string;
  buffer?: Buffer;
  buffers?: Buffer[];
  filename?: string;
  params?: Record<string, unknown>;
};

export type EngineResult = {
  text?: string;
  buffer?: Buffer;
  buffers?: Buffer[];
  mimeType?: string;
  filename?: string;
  metadata?: Record<string, unknown>;
};

export type Engine = (input: EngineInput) => Promise<EngineResult>;
