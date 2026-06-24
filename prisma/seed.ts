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

  // Hash password (shared across all seed accounts for easy demo login)
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // --- Agents ---
  const agent1 = await prisma.user.create({
    data: { name: "Support Agent One", email: "agent@xendesk.com", passwordHash, role: UserRole.AGENT },
  });
  const agent2 = await prisma.user.create({
    data: { name: "Support Agent Two", email: "agent2@xendesk.com", passwordHash, role: UserRole.AGENT },
  });

  // --- Customers ---
  const customer1 = await prisma.user.create({
    data: { name: "John Customer", email: "customer@xendesk.com", passwordHash, role: UserRole.CUSTOMER },
  });
  const customer2 = await prisma.user.create({
    data: { name: "Amara Okello", email: "customer2@xendesk.com", passwordHash, role: UserRole.CUSTOMER },
  });
  const customer3 = await prisma.user.create({
    data: { name: "Brian Mugisha", email: "customer3@xendesk.com", passwordHash, role: UserRole.CUSTOMER },
  });

  // --- Tags ---
  const billingTag = await prisma.tag.create({ data: { name: "Billing" } });
  const networkTag = await prisma.tag.create({ data: { name: "Network" } });
  const accountTag = await prisma.tag.create({ data: { name: "Account" } });
  const techTag = await prisma.tag.create({ data: { name: "Technical" } });

  // --- Tickets ---
  const ticketSeeds = [
    {
      title: "Unable to access account",
      description: "Customer cannot log in after password reset.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      customerId: customer1.id,
      agentId: agent1.id,
      tagIds: [accountTag.id, techTag.id],
      comments: [
        { userId: agent1.id, message: "We are looking into this issue." },
        { userId: customer1.id, message: "Thank you, waiting for update." },
      ],
    },
    {
      title: "Billing issue with subscription",
      description: "Charged twice for monthly subscription.",
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      customerId: customer1.id,
      agentId: agent1.id,
      tagIds: [billingTag.id],
      comments: [{ userId: agent1.id, message: "We have processed a refund, confirming now." }],
    },
    {
      title: "Cannot connect to office VPN",
      description: "VPN client times out every time I try to connect from home.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      customerId: customer2.id,
      agentId: null,
      tagIds: [networkTag.id, techTag.id],
      comments: [],
    },
    {
      title: "Invoice missing from billing portal",
      description: "Last month's invoice does not appear in my billing history.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.LOW,
      customerId: customer2.id,
      agentId: null,
      tagIds: [billingTag.id],
      comments: [],
    },
    {
      title: "Password reset email not arriving",
      description: "Requested a password reset three times, no email received.",
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      customerId: customer2.id,
      agentId: agent2.id,
      tagIds: [accountTag.id],
      comments: [{ userId: agent2.id, message: "Checking our email delivery logs now." }],
    },
    {
      title: "App crashes on file upload",
      description: "Uploading a PDF larger than 5MB crashes the dashboard tab.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      customerId: customer3.id,
      agentId: agent2.id,
      tagIds: [techTag.id],
      comments: [
        { userId: customer3.id, message: "Happens every time, even after a refresh." },
        { userId: agent2.id, message: "Reproduced on our end, escalating to engineering." },
      ],
    },
    {
      title: "Request to change account email",
      description: "Need to update the email address associated with my account.",
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.LOW,
      customerId: customer3.id,
      agentId: agent1.id,
      tagIds: [accountTag.id],
      comments: [
        { userId: agent1.id, message: "Email updated successfully." },
        { userId: customer3.id, message: "Confirmed, thank you!" },
      ],
    },
    {
      title: "Slow network speeds during peak hours",
      description: "Connection drops to under 1Mbps every evening between 7-9pm.",
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      customerId: customer1.id,
      agentId: agent2.id,
      tagIds: [networkTag.id],
      comments: [{ userId: agent2.id, message: "Monitoring your connection, will follow up tomorrow." }],
    },
    {
      title: "Duplicate charge on credit card",
      description: "Two identical charges appeared on my statement this week.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      customerId: customer2.id,
      agentId: null,
      tagIds: [billingTag.id],
      comments: [],
    },
    {
      title: "Feature request: dark mode",
      description: "Would love a dark mode option for the dashboard.",
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.LOW,
      customerId: customer3.id,
      agentId: agent1.id,
      tagIds: [],
      comments: [{ userId: agent1.id, message: "Added to our roadmap, thanks for the suggestion!" }],
    },
    {
      title: "Two-factor authentication not working",
      description: "Authenticator codes are rejected even though they appear correct.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      customerId: customer1.id,
      agentId: null,
      tagIds: [accountTag.id, techTag.id],
      comments: [],
    },
    {
      title: "Wifi router keeps disconnecting",
      description: "Router restarts itself randomly, every few hours.",
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      customerId: customer3.id,
      agentId: agent2.id,
      tagIds: [networkTag.id],
      comments: [{ userId: agent2.id, message: "Sending you a replacement router, tracking to follow." }],
    },
  ];

  for (const seed of ticketSeeds) {
    const ticket = await prisma.ticket.create({
      data: {
        title: seed.title,
        description: seed.description,
        status: seed.status,
        priority: seed.priority,
        customerId: seed.customerId,
        agentId: seed.agentId,
        tags: {
          create: seed.tagIds.map((tagId) => ({ tagId })),
        },
      },
    });

    if (seed.comments.length > 0) {
      await prisma.comment.createMany({
        data: seed.comments.map((c) => ({
          ticketId: ticket.id,
          userId: c.userId,
          message: c.message,
        })),
      });
    }
  }

  console.log("Seeding completed successfully");
  console.log("");
  console.log("Demo accounts (all use password: Password123!)");
  console.log("  Agent:    agent@xendesk.com / agent2@xendesk.com");
  console.log("  Customer: customer@xendesk.com / customer2@xendesk.com / customer3@xendesk.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  