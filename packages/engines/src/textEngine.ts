import slugify from "slugify";
import { Engine } from "./types.js";

export const textEngine: Engine = async ({ text = "", params }) => {
  const action = params?.action as string;
  switch (action) {
    case "uppercase":
      return { text: text.toUpperCase() };
    case "lowercase":
      return { text: text.toLowerCase() };
    case "reverse":
      return { text: text.split("").reverse().join("") };
    case "trim":
      return { text: text.trim() };
    case "slugify":
      return { text: slugify(text, { lower: true, strict: true }) };
    case "wordcount":
      return { text: `${text.trim().split(/\s+/).filter(Boolean).length}` };
    case "sentencecase":
      return {
        text:
          text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
      };
    case "titlecase":
      return {
        text: text
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      };
    case "dedupe": {
      const seen = new Set<string>();
      const lines = text.split(/\r?\n/).filter((line) => {
        if (seen.has(line)) return false;
        seen.add(line);
        return true;
      });
      return { text: lines.join("\n") };
    }
    case "linebreaks":
      return { text: text.replace(/\r?\n/g, "\n") };
    case "url": {
      const url = new URL(text);
      return {
        text: JSON.stringify(
          {
            protocol: url.protocol,
            host: url.host,
            hostname: url.hostname,
            path: url.pathname,
            query: Object.fromEntries(url.searchParams.entries())
          },
          null,
          2
        )
      };
    }
    default:
      return { text };
  }
};
