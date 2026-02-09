import { validateRegistry } from "./validation.js";
import { toolRegistry } from "./toolRegistry.js";
import {
  textEngine,
  aiTextEngine,
  imageEngine,
  pdfEngine,
  archiveEngine,
  videoEngine,
  audioEngine,
  docConvertEngine
} from "@omni/engines";

const run = async () => {
  const count = validateRegistry();
  console.log(`Registry valid with ${count} tools`);

  const sample = toolRegistry.slice(0, 30);
  for (const tool of sample) {
    const engineMap: Record<string, any> = {
      textEngine,
      aiTextEngine,
      imageEngine,
      pdfEngine,
      archiveEngine,
      videoEngine,
      audioEngine,
      docConvertEngine
    };
    const engine = engineMap[tool.runner.engineKey];
    if (!engine) throw new Error(`Missing engine ${tool.runner.engineKey}`);
    const payload: any = { params: tool.runner.engineParams };
    if (tool.kind === "text" || tool.kind === "url") {
      payload.text = "Hello World";
    } else {
      payload.buffer = Buffer.from("test");
      payload.buffers = [Buffer.from("test"), Buffer.from("test2")];
    }
    const result = await engine(payload);
    if (!result) throw new Error(`Tool ${tool.slug} returned no result`);
  }
  console.log("Smoke test passed");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
