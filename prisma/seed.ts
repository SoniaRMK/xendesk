import { PrismaClient, UserRole, TicketStatus, TicketPriority } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data (safe for dev only)
  await prisma.comment.deleteMany();
  await prisma.ticketTag.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  // Hash password
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // Create users
  const agent = await prisma.user.create({
    data: {
      name: "Support Agent",
      email: "agent@xendesk.com",
      passwordHash,
      role: UserRole.AGENT,
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "John Customer",
      email: "customer@xendesk.com",
      passwordHash,
      role: UserRole.CUSTOMER,
    },
  });

  // Create tags
  const billingTag = await prisma.tag.create({ data: { name: "Billing" } });
  const techTag = await prisma.tag.create({ data: { name: "Technical" } });
  const accountTag = await prisma.tag.create({ data: { name: "Account" } });

  // Create tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      title: "Unable to access account",
      description: "Customer cannot log in after password reset",
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      customerId: customer.id,
      agentId: agent.id,
      tags: {
        create: [
          { tagId: accountTag.id },
          { tagId: techTag.id },
        ],
      },
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      title: "Billing issue with subscription",
      description: "Charged twice for monthly subscription",
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      customerId: customer.id,
      agentId: agent.id,
      tags: {
        create: [{ tagId: billingTag.id }],
      },
    },
  });

  // Create comments
  await prisma.comment.createMany({
    data: [
      {
        message: "We are looking into this issue.",
        ticketId: ticket1.id,
        userId: agent.id,
      },
      {
        message: "Thank you, waiting for update.",
        ticketId: ticket1.id,
        userId: customer.id,
      },
      {
        message: "We have processed a refund.",
        ticketId: ticket2.id,
        userId: agent.id,
      },
    ],
  });

  console.log("Seeding completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
