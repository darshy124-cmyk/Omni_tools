import { MetadataRoute } from "next";
import { listTools } from "@omni/core";

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = listTools();
  return [
    { url: "http://localhost:3000", lastModified: new Date() },
    { url: "http://localhost:3000/tools", lastModified: new Date() },
    ...tools.map((tool) => ({
      url: `http://localhost:3000/tools/${tool.slug}`,
      lastModified: new Date()
    }))
  ];
}
