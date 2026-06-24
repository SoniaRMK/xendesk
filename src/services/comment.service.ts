import { prisma } from "@/lib/prisma";

export async function addComment(input: {
  ticketId: string;
  userId: string;
  message: string;
}) {
  return prisma.comment.create({
    data: {
      ticketId: input.ticketId,
      userId: input.userId,
      message: input.message,
    },
  });
}

export async function getTicketOwnerId(ticketId: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { customerId: true },
  });
  return ticket?.customerId ?? null;
}
