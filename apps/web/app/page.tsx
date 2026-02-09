import { listTools, toolCount } from "@omni/core";
import { Button } from "@omni/ui";

export default function HomePage() {
  const tools = listTools().slice(0, 6);
  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-10 text-white">
        <h1 className="text-4xl font-semibold">OmniTool AI</h1>
        <p className="mt-3 max-w-2xl text-lg text-indigo-100">
          A premium productivity suite with {toolCount} tools, unified jobs,
          secure storage, and AI automation.
        </p>
        <div className="mt-6 flex gap-4">
          <Button className="bg-white text-indigo-600">Browse tools</Button>
          <Button className="bg-indigo-500">View dashboard</Button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {tools.map((tool) => (
          <div key={tool.id} className="rounded-xl border bg-white p-5">
            <div className="text-xs uppercase text-gray-500">
              {tool.category}
            </div>
            <div className="mt-2 text-lg font-semibold">{tool.name}</div>
            <p className="mt-2 text-sm text-gray-600">{tool.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
