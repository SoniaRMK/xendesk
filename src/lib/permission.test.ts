import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next-auth's getServerSession before importing the module under test.
const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

// next/navigation's redirect() throws in real Next.js (it works by throwing
// a special error caught by the framework). We replicate that here so
// requireUser's redirect-then-stop control flow is testable.
const mockRedirect = vi.fn((path: string) => {
  throw new Error(`REDIRECT:${path}`);
});
vi.mock("next/navigation", () => ({
  redirect: (path: string) => mockRedirect(path),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

import { getCurrentUser, requireUser, requireUserOrThrow } from "@/lib/permission";

const AGENT_SESSION = {
  user: { id: "agent-1", email: "agent@xendesk.com", name: "Agent One", role: "AGENT" },
};

const CUSTOMER_SESSION = {
  user: { id: "cust-1", email: "cust@xendesk.com", name: "Customer One", role: "CUSTOMER" },
};

beforeEach(() => {
  mockGetServerSession.mockReset();
  mockRedirect.mockClear();
});

describe("getCurrentUser", () => {
  it("returns null when there is no session", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it("returns the session user when authenticated", async () => {
    mockGetServerSession.mockResolvedValue(AGENT_SESSION);
    const user = await getCurrentUser();
    expect(user?.role).toBe("AGENT");
    expect(user?.id).toBe("agent-1");
  });
});

describe("requireUser", () => {
  it("redirects to /login when unauthenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    await expect(requireUser()).rejects.toThrow("REDIRECT:/login");
  });

  it("allows access when no specific role is required", async () => {
    mockGetServerSession.mockResolvedValue(CUSTOMER_SESSION);
    const user = await requireUser();
    expect(user.role).toBe("CUSTOMER");
  });

  it("allows access when the user's role matches the required role", async () => {
    mockGetServerSession.mockResolvedValue(AGENT_SESSION);
    const user = await requireUser("AGENT");
    expect(user.role).toBe("AGENT");
  });

  it("redirects a customer away from an agent-only page, to /tickets", async () => {
    mockGetServerSession.mockResolvedValue(CUSTOMER_SESSION);
    await expect(requireUser("AGENT")).rejects.toThrow("REDIRECT:/tickets");
  });

  it("redirects an agent away from a customer-only page, to /dashboard", async () => {
    mockGetServerSession.mockResolvedValue(AGENT_SESSION);
    await expect(requireUser("CUSTOMER")).rejects.toThrow("REDIRECT:/dashboard");
  });
});

describe("requireUserOrThrow", () => {
  it("throws UNAUTHENTICATED when there is no session", async () => {
    mockGetServerSession.mockResolvedValue(null);
    await expect(requireUserOrThrow()).rejects.toThrow("UNAUTHENTICATED");
  });

  it("throws FORBIDDEN when the role does not match", async () => {
    mockGetServerSession.mockResolvedValue(CUSTOMER_SESSION);
    await expect(requireUserOrThrow("AGENT")).rejects.toThrow("FORBIDDEN");
  });

  it("returns the user when the role matches", async () => {
    mockGetServerSession.mockResolvedValue(AGENT_SESSION);
    const user = await requireUserOrThrow("AGENT");
    expect(user.id).toBe("agent-1");
  });
});
