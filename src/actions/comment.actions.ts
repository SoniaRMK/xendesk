"use server";

import { requireUserOrThrow } from "@/lib/permission";
import { revalidatePath } from "next/cache";
import { addCommentSchema } from "@/lib/validations";
import { addComment, getTicketOwnerId } from "@/services/comment.service";

export async function addCommentAction(formData: FormData) {
  const user = await requireUserOrThrow();

  const parsed = addCommentSchema.safeParse({
    ticketId: formData.get("ticketId"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid comment");
  }

  const { ticketId, message } = parsed.data;

  const ownerId = await getTicketOwnerId(ticketId);

  if (!ownerId) {
    throw new Error("Ticket not found");
  }

  // Customers may only comment on their own ticket. Agents may comment on any.
  if (user.role === "CUSTOMER" && ownerId !== user.id) {
    throw new Error("FORBIDDEN");
  }

  await addComment({ ticketId, userId: user.id, message });

  revalidatePath(`/tickets/${ticketId}`);
}
