import { prisma } from "@/lib/prisma";

export async function getAllAgents() {
  return prisma.user.findMany({
    where: { role: "AGENT" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
