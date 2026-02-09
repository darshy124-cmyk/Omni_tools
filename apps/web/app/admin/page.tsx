import { listTools } from "@omni/core";

export default function AdminPage() {
  const tools = listTools();
  return (
    <div>
      <h1 className="text-3xl font-semibold">Admin</h1>
      <p className="mt-2 text-gray-600">
        Admin-only controls, seed admin, and tool registry status.
      </p>
      <div className="mt-6 rounded-lg border bg-white p-4 text-sm text-gray-700">
        {tools.length} tools registered.
      </div>
    </div>
  );
}
