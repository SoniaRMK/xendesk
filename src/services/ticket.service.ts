import { prisma } from "@/lib/prisma";
import { TicketPriority, TicketStatus, Prisma } from "@prisma/client";

export async function getTicketsForCustomer(customerId: string) {
  return prisma.ticket.findMany({
    where: { customerId },
    include: {
      agent: true,
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllTickets(filters?: {
  q?: string;
  status?: string;
  priority?: string;
  tag?: string;
}) {
  const where: Prisma.TicketWhereInput = {};

  if (filters?.status && Object.values(TicketStatus).includes(filters.status as TicketStatus)) {
    where.status = filters.status as TicketStatus;
  }

  if (
    filters?.priority &&
    Object.values(TicketPriority).includes(filters.priority as TicketPriority)
  ) {
    where.priority = filters.priority as TicketPriority;
  }

  if (filters?.tag) {
    where.tags = { some: { tagId: filters.tag } };
  }

  if (filters?.q && filters.q.trim().length > 0) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return prisma.ticket.findMany({
    where,
    include: {
      customer: true,
      agent: true,
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTicketById(id: string) {
  return prisma.ticket.findUnique({
    where: { id },
    include: {
      customer: true,
      agent: true,
      tags: { include: { tag: true } },
      comments: {
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function createTicket(input: {
  customerId: string;
  title: string;
  description: string;
  priority: TicketPriority;
  tagIds: string[];
}) {
  return prisma.ticket.create({
    data: {
      title: input.title,
      description: input.description,
      priority: input.priority,
      customerId: input.customerId,
      tags: {
        create: input.tagIds.map((tagId) => ({ tagId })),
      },
    },
  });
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: { status },
  });
}

export async function assignAgent(ticketId: string, agentId: string | null) {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: { agentId },
  });
}

export async function getTicketMetrics() {
  const tickets = await prisma.ticket.findMany({
    select: { status: true, priority: true, agentId: true },
  });

  return {
    total: tickets.length,
    open: tickets.filter((t) => t.status === TicketStatus.OPEN).length,
    inProgress: tickets.filter((t) => t.status === TicketStatus.IN_PROGRESS).length,
    resolved: tickets.filter((t) => t.status === TicketStatus.RESOLVED).length,
    highPriority: tickets.filter((t) => t.priority === TicketPriority.HIGH).length,
    unassigned: tickets.filter((t) => !t.agentId).length,
  };
}
