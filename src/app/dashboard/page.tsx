import { prisma } from "@/lib/prisma";
import { TicketStatus, TicketPriority } from "@prisma/client";
import Link from "next/link";

export default async function DashboardPage() {
  const tickets = await prisma.ticket.findMany({
    include: {
      customer: true,
      agent: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = tickets.length;
  const open = tickets.filter((t) => t.status === TicketStatus.OPEN).length;
  const inProgress = tickets.filter(
    (t) => t.status === TicketStatus.IN_PROGRESS
  ).length;
  const resolved = tickets.filter(
    (t) => t.status === TicketStatus.RESOLVED
  ).length;

  const unassigned = tickets.filter((t) => !t.agentId).length;

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">Agent Dashboard</h1>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

        <div className="p-4 border rounded">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-xl font-bold">{total}</p>
        </div>

        <div className="p-4 border rounded">
          <p className="text-sm text-gray-500">Open</p>
          <p className="text-xl font-bold">{open}</p>
        </div>

        <div className="p-4 border rounded">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-xl font-bold">{inProgress}</p>
        </div>

        <div className="p-4 border rounded">
          <p className="text-sm text-gray-500">Resolved</p>
          <p className="text-xl font-bold">{resolved}</p>
        </div>

        <div className="p-4 border rounded">
          <p className="text-sm text-gray-500">Unassigned</p>
          <p className="text-xl font-bold">{unassigned}</p>
        </div>

      </div>

      {/* TABLE */}
      <div className="border rounded overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Priority</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Agent</th>
              <th className="p-3 text-left">Tags</th>
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

                <td className="p-3">{ticket.customer.name}</td>

                <td className="p-3">
                  {ticket.agent ? ticket.agent.name : "Unassigned"}
                </td>

                <td className="p-3">
                  {ticket.tags.map((t) => t.tag.name).join(", ")}
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}
