import { getToolBySlug } from "@omni/core";
import { notFound } from "next/navigation";
import ToolClient from "./ToolClient";

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = getToolBySlug(params.slug);
  if (!tool) return notFound();
  return <ToolClient tool={tool} />;
}
