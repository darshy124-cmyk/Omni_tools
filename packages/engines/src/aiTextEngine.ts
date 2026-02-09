import { Engine } from "./types.js";
import { runAi } from "./aiProvider.js";

export const aiTextEngine: Engine = async ({ text = "", params }) => {
  const action = (params?.action as string) || "summarize";
  const response = await runAi({ action, prompt: text });
  return { text: response.text };
};
