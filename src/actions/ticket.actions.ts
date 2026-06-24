"use server";

import { requireUserOrThrow } from "@/lib/permission";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createTicketSchema,
  updateTicketStatusSchema,
  assignAgentSchema,
} from "@/lib/validations";
import {
  createTicket,
  updateTicketStatus,
  assignAgent,
} from "@/services/ticket.service";

export async function createTicketAction(formData: FormData) {
  const user = await requireUserOrThrow("CUSTOMER");

  const tagIds = formData.getAll("tagIds").map(String);

  const parsed = createTicketSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    tagIds,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid ticket data");
  }

  const ticket = await createTicket({
    customerId: user.id,
    ...parsed.data,
  });

  revalidatePath("/tickets");
  redirect(`/tickets/${ticket.id}`);
}

export async function updateTicketStatusAction(formData: FormData) {
  await requireUserOrThrow("AGENT");

  const parsed = updateTicketStatusSchema.safeParse({
    ticketId: formData.get("ticketId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid status update");
  }

  await updateTicketStatus(parsed.data.ticketId, parsed.data.status);

  revalidatePath(`/tickets/${parsed.data.ticketId}`);
  revalidatePath("/dashboard");
}

export async function assignAgentAction(formData: FormData) {
  await requireUserOrThrow("AGENT");

  const parsed = assignAgentSchema.safeParse({
    ticketId: formData.get("ticketId"),
    agentId: formData.get("agentId") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid assignment");
  }

  await assignAgent(parsed.data.ticketId, parsed.data.agentId || null);

  revalidatePath(`/tickets/${parsed.data.ticketId}`);
  revalidatePath("/dashboard");
}
