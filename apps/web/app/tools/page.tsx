import { listTools } from "@omni/core";

export default function ToolsPage() {
  const tools = listTools();
  return (
    <div>
      <h1 className="text-3xl font-semibold">All Tools</h1>
      <p className="mt-2 text-sm text-gray-600">
        Explore {tools.length} tools across text, AI, media, and document
        workflows.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {tools.map((tool) => (
          <a
            key={tool.id}
            className="rounded-lg border bg-white p-4 hover:shadow"
            href={`/tools/${tool.slug}`}
          >
            <div className="text-xs uppercase text-gray-500">
              {tool.category}
            </div>
            <div className="mt-1 text-lg font-semibold">{tool.name}</div>
            <div className="mt-2 text-sm text-gray-600">{tool.description}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
