import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permission";
import { createTicketAction } from "@/actions/ticket.actions";

export default async function NewTicketPage() {
  await requireUser("CUSTOMER");
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">New Support Ticket</h1>

      <form action={createTicketAction} className="space-y-4 rounded border p-6">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            minLength={3}
            maxLength={200}
            placeholder="Brief summary of the issue"
            className="w-full rounded border p-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            required
            minLength={10}
            maxLength={5000}
            rows={5}
            placeholder="Describe the issue in detail"
            className="w-full rounded border p-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            defaultValue="MEDIUM"
            className="w-full rounded border p-2 text-sm"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        {tags.length > 0 && (
          <div className="space-y-1">
            <span className="text-sm font-medium">Tags</span>
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <label key={tag.id} className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" name="tagIds" value={tag.id} />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <button type="submit" className="w-full rounded bg-black p-2 text-sm text-white">
          Submit Ticket
        </button>
      </form>
    </div>
  );
}
