import { describe, it, expect } from "vitest";
import {
  createTicketSchema,
  updateTicketStatusSchema,
  assignAgentSchema,
  addCommentSchema,
} from "@/lib/validations";

describe("createTicketSchema", () => {
  it("accepts a valid ticket", () => {
    const result = createTicketSchema.safeParse({
      title: "Cannot log in",
      description: "I get an error every time I try to log in.",
      priority: "HIGH",
      tagIds: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a title shorter than 3 characters", () => {
    const result = createTicketSchema.safeParse({
      title: "Hi",
      description: "Valid description here.",
      priority: "LOW",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a description shorter than 10 characters", () => {
    const result = createTicketSchema.safeParse({
      title: "Valid title",
      description: "Too short",
      priority: "LOW",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a priority value outside the enum", () => {
    const result = createTicketSchema.safeParse({
      title: "Valid title",
      description: "Valid description here.",
      priority: "URGENT",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateTicketStatusSchema", () => {
  it("accepts a valid status transition payload", () => {
    const result = updateTicketStatusSchema.safeParse({
      ticketId: "ticket-123",
      status: "IN_PROGRESS",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a status value outside the enum", () => {
    const result = updateTicketStatusSchema.safeParse({
      ticketId: "ticket-123",
      status: "CLOSED",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing ticketId", () => {
    const result = updateTicketStatusSchema.safeParse({
      status: "OPEN",
    });
    expect(result.success).toBe(false);
  });
});

describe("assignAgentSchema", () => {
  it("accepts an assignment with an agentId", () => {
    const result = assignAgentSchema.safeParse({
      ticketId: "ticket-123",
      agentId: "agent-456",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an unassignment (no agentId)", () => {
    const result = assignAgentSchema.safeParse({
      ticketId: "ticket-123",
    });
    expect(result.success).toBe(true);
  });
});

describe("addCommentSchema", () => {
  it("rejects an empty message", () => {
    const result = addCommentSchema.safeParse({
      ticketId: "ticket-123",
      message: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a non-empty message", () => {
    const result = addCommentSchema.safeParse({
      ticketId: "ticket-123",
      message: "Thanks for the update.",
    });
    expect(result.success).toBe(true);
  });
});
