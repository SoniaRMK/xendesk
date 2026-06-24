import { requireUser } from "@/lib/permission";
import { getTicketById } from "@/services/ticket.service";
import { getAllAgents } from "@/services/user.service";
import { notFound } from "next/navigation";
import { TicketControls } from "@/components/tickets/TicketControls";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await requireUser();
  const ticket = await getTicketById(id);

  if (!ticket) return notFound();

  if (user.role === "CUSTOMER" && ticket.customerId !== user.id) {
    return notFound();
  }

  const isAgent = user.role === "AGENT";
  const agents = isAgent ? await getAllAgents() : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="space-y-3 rounded border p-4">
        <h1 className="text-2xl font-bold">{ticket.title}</h1>
        <p className="text-gray-600">{ticket.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span>Status: {ticket.status}</span>
          <span>Priority: {ticket.priority}</span>
          <span>Agent: {ticket.agent ? ticket.agent.name : "Unassigned"}</span>
        </div>

        <div className="text-sm text-gray-500">
          Tags: {ticket.tags.map((t) => t.tag.name).join(", ") || "—"}
        </div>

        {isAgent && (
          <TicketControls
            ticketId={ticket.id}
            currentStatus={ticket.status}
            currentAgentId={ticket.agentId}
            agents={agents}
          />
        )}
      </div>

      <div className="rounded border p-4 text-sm text-gray-400">
        Comments coming next.
      </div>
    </div>
  );
}
