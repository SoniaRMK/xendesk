import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

/**
 * Returns the current session's user, or null if not authenticated.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  console.log("SiteHeader/getCurrentUser session:", session);
  if (!session?.user) return null;
  return session.user as unknown as SessionUser;
}

/**
 * Use in Server Components / pages. Redirects to /login if not authenticated.
 * Optionally restrict to a specific role; redirects to that role's home if mismatched.
 */
export async function requireUser(allowedRole?: UserRole): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (allowedRole && user.role !== allowedRole) {
    redirect(user.role === "AGENT" ? "/dashboard" : "/tickets");
  }

  return user;
}

/**
 * Use in Server Actions, where redirecting isn't appropriate.
 * Throws so the caller can handle it as a failed action.
 */
export async function requireUserOrThrow(allowedRole?: UserRole): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  if (allowedRole && user.role !== allowedRole) {
    throw new Error("FORBIDDEN");
  }

  return user;
}
