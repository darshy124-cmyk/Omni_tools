import { prisma } from "@omni/db";

export default async function DashboardPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { tool: true }
  });
  return (
    <div>
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Track your jobs, usage limits, and queued tasks.
      </p>
      <div className="mt-6 rounded-lg border bg-white p-4">
        <div className="text-sm font-semibold text-gray-700">Recent jobs</div>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          {jobs.map((job) => (
            <li key={job.id}>
              {job.tool.name} — {job.status} ({job.progress}%)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
