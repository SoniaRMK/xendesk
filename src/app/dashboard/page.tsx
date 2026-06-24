import { requireUser } from "@/lib/permission";
import { getAllTickets, getTicketMetrics } from "@/services/ticket.service";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

type SearchParams = {
  q?: string;
  status?: string;
  priority?: string;
  tag?: string;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireUser("AGENT");

  const { q, status, priority, tag } = await searchParams;

  const [metrics, tickets, allTags] = await Promise.all([
    getTicketMetrics(),
    getAllTickets({ q, status, priority, tag }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  const hasActiveFilters = Boolean(q || status || priority || tag);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Agent Dashboard</h1>

      {/* METRICS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
        <Metric label="Total" value={metrics.total} />
        <Metric label="Open" value={metrics.open} />
        <Metric label="In Progress" value={metrics.inProgress} />
        <Metric label="Resolved" value={metrics.resolved} />
        <Metric label="High Priority" value={metrics.highPriority} />
        <Metric label="Unassigned" value={metrics.unassigned} />
      </div>

      {/* SEARCH & FILTERS */}
      <form method="GET" className="flex flex-wrap items-end gap-3 rounded border p-4">
        <div className="min-w-[200px] flex-1 space-y-1">
          <label className="text-xs font-medium text-gray-500" htmlFor="q">
            Search
          </label>
          <input
            id="q"
            name="q"
            type="text"
            defaultValue={q ?? ""}
            placeholder="Search title or description..."
            className="w-full rounded border p-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="rounded border p-2 text-sm"
          >
            <option value="">All</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500" htmlFor="priority">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={priority ?? ""}
            className="rounded border p-2 text-sm"
          >
            <option value="">All</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500" htmlFor="tag">
            Tag
          </label>
          <select
            id="tag"
            name="tag"
            defaultValue={tag ?? ""}
            className="rounded border p-2 text-sm"
          >
            <option value="">All</option>
            {allTags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="rounded bg-black px-4 py-2 text-sm text-white">
          Apply
        </button>

        {hasActiveFilters && (
          <a href="/dashboard" className="text-sm text-gray-500 underline">
            Clear filters
          </a>
        )}
      </form>

      {/* TABLE */}
      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Priority</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Agent</th>
              <th className="p-3 text-left">Tags</th>
              <th className="p-3 text-left">Created</th>
            </tr>
          </thead>

          <tbody>
            {tickets.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  {hasActiveFilters ? "No tickets match your filters." : "No tickets yet."}
                </td>
              </tr>
            )}

            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <Link href={`/tickets/${ticket.id}`} className="hover:underline">
                    {ticket.title}
                  </Link>
                </td>
                <td className="p-3">{ticket.status}</td>
                <td className="p-3">{ticket.priority}</td>
                <td className="p-3">{ticket.customer.name}</td>
                <td className="p-3">{ticket.agent ? ticket.agent.name : "Unassigned"}</td>
                <td className="p-3">{ticket.tags.map((t) => t.tag.name).join(", ") || "—"}</td>
                <td className="p-3 text-gray-500">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasActiveFilters && (
        <p className="text-sm text-gray-500">
          Showing {tickets.length} of {metrics.total} tickets.
        </p>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
