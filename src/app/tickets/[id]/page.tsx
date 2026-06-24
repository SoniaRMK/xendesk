import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function TicketPage({
  params,
}: {
  params: { id: string };
}) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      agent: true,
      tags: {
        include: { tag: true },
      },
      comments: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!ticket) return notFound();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div className="border rounded p-4 space-y-2">
        <h1 className="text-2xl font-bold">{ticket.title}</h1>

        <p className="text-gray-600">{ticket.description}</p>

        <div className="flex gap-4 text-sm text-gray-500">
          <span>Status: {ticket.status}</span>
          <span>Priority: {ticket.priority}</span>
          <span>
            Agent: {ticket.agent ? ticket.agent.name : "Unassigned"}
          </span>
        </div>

        <div className="text-sm text-gray-500">
          Tags: {ticket.tags.map((t) => t.tag.name).join(", ")}
        </div>
      </div>

      {/* CHAT THREAD */}
      <div className="border rounded p-4 space-y-4">

        <h2 className="font-semibold">Conversation</h2>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">

          {ticket.comments.map((comment) => {
            const isAgent = comment.user.role === "AGENT";

            return (
              <div
                key={comment.id}
                className={`p-3 rounded max-w-[70%] ${
                  isAgent
                    ? "bg-blue-100 ml-auto text-right"
                    : "bg-gray-100"
                }`}
              >
                <p className="text-sm">{comment.message}</p>

                <p className="text-xs text-gray-500 mt-1">
                  {comment.user.name} •{" "}
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
            );
          })}

        </div>
      </div>

      {/* NOTE: We will add reply box next step */}
      <div className="text-sm text-gray-400">
        Reply system coming next (agent + customer messaging)
      </div>

    </div>
  );
}
