"use client";

import { updateTicketStatusAction, assignAgentAction } from "@/actions/ticket.actions";

type Agent = { id: string; name: string };

export function TicketControls({
  ticketId,
  currentStatus,
  currentAgentId,
  agents,
}: {
  ticketId: string;
  currentStatus: string;
  currentAgentId: string | null;
  agents: Agent[];
}) {
  return (
    <div className="flex flex-wrap gap-4 border-t pt-3">
      <form action={updateTicketStatusAction} className="flex items-center gap-2">
        <input type="hidden" name="ticketId" value={ticketId} />
        <label className="text-sm text-gray-500">Status</label>
        <select
          name="status"
          defaultValue={currentStatus}
          className="rounded border p-1 text-sm"
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        >
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </form>

      <form action={assignAgentAction} className="flex items-center gap-2">
        <input type="hidden" name="ticketId" value={ticketId} />
        <label className="text-sm text-gray-500">Assigned to</label>
        <select
          name="agentId"
          defaultValue={currentAgentId ?? ""}
          className="rounded border p-1 text-sm"
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        >
          <option value="">Unassigned</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </form>
    </div>
  );
}
