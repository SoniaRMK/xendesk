import { requireUser } from "@/lib/permission";
import { getTicketById } from "@/services/ticket.service";
import { getAllAgents } from "@/services/user.service";
import { notFound } from "next/navigation";
import { TicketControls } from "@/components/tickets/TicketControls";
import { addCommentAction } from "@/actions/comment.actions";

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
      {/* HEADER */}
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

      {/* CONVERSATION */}
      <div className="space-y-4 rounded border p-4">
        <h2 className="font-semibold">Conversation</h2>

        <div className="max-h-[400px] space-y-3 overflow-y-auto">
          {ticket.comments.length === 0 && (
            <p className="text-sm text-gray-400">No comments yet.</p>
          )}

          {ticket.comments.map((comment) => {
            const fromAgent = comment.user.role === "AGENT";

            return (
              <div
                key={comment.id}
                className={`max-w-[70%] rounded p-3 ${
                  fromAgent ? "ml-auto bg-blue-100 text-right" : "bg-gray-100"
                }`}
              >
                <p className="text-sm">{comment.message}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {comment.user.name} • {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>

        {/* REPLY FORM */}
        <form action={addCommentAction} className="flex gap-2 border-t pt-3">
          <input type="hidden" name="ticketId" value={ticket.id} />
          <input
            type="text"
            name="message"
            placeholder="Write a reply..."
            required
            maxLength={2000}
            className="flex-1 rounded border p-2 text-sm"
          />
          <button type="submit" className="rounded bg-black px-4 py-2 text-sm text-white">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
