import { z } from "zod";
import { TicketPriority, TicketStatus } from "@prisma/client";

export const createTicketSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().trim().min(10, "Please describe the issue in more detail").max(5000),
  priority: z.nativeEnum(TicketPriority),
  tagIds: z.array(z.string()).optional().default([]),
});

export const updateTicketStatusSchema = z.object({
  ticketId: z.string().min(1),
  status: z.nativeEnum(TicketStatus),
});

export const assignAgentSchema = z.object({
  ticketId: z.string().min(1),
  agentId: z.string().optional(),
});

export const addCommentSchema = z.object({
  ticketId: z.string().min(1),
  message: z.string().trim().min(1, "Message cannot be empty").max(2000),
});
