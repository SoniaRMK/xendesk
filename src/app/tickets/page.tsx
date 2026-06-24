import { requireUser } from "@/lib/permission";
import { getTicketsForCustomer } from "@/services/ticket.service";
import Link from "next/link";

export default async function TicketsPage() {
  const user = await requireUser("CUSTOMER");
  const tickets = await getTicketsForCustomer(user.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Tickets</h1>
        <Link
          href="/tickets/new"
          className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          + New Ticket
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded border p-8 text-center text-gray-400">
          You haven&apos;t submitted any tickets yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Priority</th>
                <th className="p-3 text-left">Agent</th>
                <th className="p-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <Link href={`/tickets/${ticket.id}`} className="hover:underline">
                      {ticket.title}
                    </Link>
                  </td>
                  <td className="p-3">{ticket.status}</td>
                  <td className="p-3">{ticket.priority}</td>
                  <td className="p-3">{ticket.agent ? ticket.agent.name : "Unassigned"}</td>
                  <td className="p-3 text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
