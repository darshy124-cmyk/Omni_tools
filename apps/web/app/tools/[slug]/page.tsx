import { getToolBySlug } from "@omni/core";
import { notFound } from "next/navigation";

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = getToolBySlug(params.slug);
  if (!tool) return notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{tool.name}</h1>
        <p className="mt-2 text-gray-600">{tool.description}</p>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <div className="text-sm text-gray-500">Category</div>
        <div className="mt-1 text-lg font-semibold">{tool.category}</div>
        <div className="mt-4 grid gap-2 text-sm text-gray-600">
          <div>Kind: {tool.kind}</div>
          <div>Tier: {tool.tier}</div>
          <div>Engine: {tool.runner.engineKey}</div>
        </div>
      </div>
    </div>
  );
}
