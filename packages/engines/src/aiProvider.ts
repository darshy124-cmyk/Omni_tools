import crypto from "node:crypto";

export type AiRequest = {
  prompt: string;
  action: string;
};

export type AiResponse = {
  text: string;
};

const deterministicHash = (input: string) =>
  crypto.createHash("sha256").update(input).digest("hex");

export const runAi = async (request: AiRequest): Promise<AiResponse> => {
  const provider = process.env.AI_PROVIDER || "mock";
  if (provider === "mock") {
    const hash = deterministicHash(`${request.action}:${request.prompt}`);
    return {
      text: `MOCK-${request.action.toUpperCase()}: ${hash.slice(0, 48)}`
    };
  }

  const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error("AI_API_KEY is required for production providers");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant executing action ${request.action}.`
        },
        { role: "user", content: request.prompt }
      ]
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`AI provider error: ${response.status} ${body}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content || "";
  return { text };
};
