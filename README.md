# XenDesk — Internal Customer Support & Ticketing System

A full-stack support ticketing application built for the XenFi Systems Senior Fullstack Engineer practical task. Customers submit and track support tickets; agents triage, assign, and resolve them.

## Live Demo

- **App:** https://xendesk-virid.vercel.app
- **Repo:** https://github.com/SoniaRMK/xendesk

## Demo Credentials

All seeded accounts share the password `Password123!`.

| Role | Email |
|------|-------|
| Agent | `agent@xendesk.com` |
| Agent | `agent2@xendesk.com` |
| Customer | `customer@xendesk.com` |
| Customer | `customer2@xendesk.com` |
| Customer | `customer3@xendesk.com` |

## Tech Stack & Why

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js (App Router) | Server Components keep data fetching close to the database with no client-side waterfall; Server Actions remove the need for hand-written API boilerplate for mutations. |
| Language | TypeScript | End-to-end type safety from the database (via Prisma's generated types) through to the UI. |
| Database | PostgreSQL (Supabase) | Relational data with real foreign keys and a many-to-many tagging system is a natural fit for SQL over a document store. |
| ORM | Prisma | Type-safe queries, declarative schema, and built-in migration tooling. Pinned to the stable 6.x line rather than the newly released 7.x, which at the time of building had sparse documentation and open issues affecting the driver-adapter model. |
| Auth | NextAuth (Auth.js) v4, Credentials provider, JWT sessions | Credentials-based login matches the brief's two-role model without needing a third-party identity provider. JWT sessions avoid an extra database round-trip per request and avoid needing a sessions table. |
| Styling | Tailwind CSS v4 | Utility-first styling with no separate CSS files to maintain; fast to iterate under time constraints. |
| Validation | Zod | Schema validation shared between form expectations and server-side enforcement, with readable error messages. |

## Beyond the Minimum Requirements

Two of the brief's optional differentiators were completed:

- **Targeted database indexing.** `@@index` on `Ticket.status`, `Ticket.priority`, `Ticket.customerId`, and `Ticket.agentId`, and on `Comment.ticketId`/`Comment.userId`, matching the actual filter and lookup patterns used by the dashboard and ticket pages. No caching layer was added; the indexing alone was judged sufficient at this data scale.
- **Unit tests + CI.** 21 Vitest tests cover the RBAC permission helpers (`requireUser`, `requireUserOrThrow` — redirect behavior, role enforcement) and the Zod validation schemas (required fields, enum enforcement on ticket status/priority). A GitHub Actions workflow runs lint, type-check, tests, and build on every push to `main`. Tests were scoped to these two files deliberately, since they're pure-logic and fully isolatable without a live database; testing the service/action layers meaningfully would require a test database, which was out of scope for the available time.

## Architecture

The codebase is organized by **layer**, not by feature:

```
src/
  app/              → routes only: pages compose data + components, no business logic
  components/       → UI, split into ui/ (generic) and feature folders (tickets/, comments/, etc.)
  lib/              → cross-cutting concerns: db client, auth config, RBAC helpers, validation schemas
  services/         → data access layer — the only code that calls Prisma directly
  actions/          → Server Actions — validate input, enforce RBAC, then delegate to services
  types/            → shared TypeScript types
```

**Why layers over features:** for a project this size, with one engineer and a tight deadline, having one obvious place to look for "anything that talks to the database" (`services/`) and one obvious place for "anything that mutates data" (`actions/`) reduces the chance of duplicated or inconsistent query logic, more than feature-colocation would have helped here.

### Request flow for a mutation (e.g. changing ticket status)

1. **Page** (`app/tickets/[id]/page.tsx`) — Server Component, fetches the ticket via the service layer, renders a form bound to a Server Action.
2. **Client Component** (`components/tickets/TicketControls.tsx`) — the only piece of this flow that needs browser interactivity (auto-submitting a `select` on change), kept as small as possible.
3. **Server Action** (`actions/ticket.actions.ts`) — re-derives the session server-side (never trusts the client), validates input with Zod, and only then calls the service layer.
4. **Service** (`services/ticket.service.ts`) — the only code that issues the actual Prisma query.

### RBAC strategy

Enforced at three layers, since frontend checks alone are not sufficient:

1. **Page-level guard** — every protected page calls `requireUser()` or `requireUser("AGENT" | "CUSTOMER")`, which redirects unauthenticated or wrong-role users before any data is fetched.
2. **Action-level guard** — every Server Action calls `requireUserOrThrow()`, re-deriving the session server-side rather than trusting any role value passed from the client.
3. **Query-level scoping** — a customer's ticket queries are filtered by `customerId` at the Prisma call itself. Attempting to view another customer's ticket by guessing its URL returns a 404, not a 403, so as not to confirm that the ticket exists.

## Database Design

```
User ──< Ticket (as customer)
User ──< Ticket (as agent, nullable)
User ──< Comment
Ticket ──< Comment
Ticket >──< Tag   (via TicketTag join table)
```

- `Ticket.agentId` is nullable — tickets start unassigned, which powers the "Unassigned" dashboard metric and filter.
- `Comment` cascades on ticket deletion; `Ticket` does not cascade on user deletion, so a ticket's history survives even if its customer or agent record is removed.
- `TicketTag` is an explicit join model (rather than Prisma's implicit many-to-many) for clearer generated SQL and room to extend later (e.g. who applied a tag, when).
- Indexes on `Ticket.status`, `Ticket.priority`, `Ticket.customerId`, and `Ticket.agentId` support the dashboard's filtering and metrics queries, which are the most frequent and highest-cardinality lookups in the app.

## Setup

Clone and install:

    git clone https://github.com/SoniaRMK/xendesk.git
    cd xendesk
    npm install

Create a `.env` file (see `.env.example`) with the following variables:

    DATABASE_URL="<Supabase transaction pooler URL, port 6543, with &pgbouncer=true>"
    DIRECT_URL="<Supabase session pooler URL, port 5432>"
    NEXTAUTH_SECRET="<generate with: npx auth secret>"
    NEXTAUTH_URL="http://localhost:3000"

For a Vercel deployment, set the same four variables in Project Settings → Environment Variables, with `NEXTAUTH_URL` set to the deployed URL (e.g. `https://xendesk-virid.vercel.app`) rather than `localhost`.

Generate the Prisma client, apply migrations, and seed demo data:

    npx prisma generate
    npx prisma migrate deploy
    npx prisma db seed

Run the dev server:

    npm run dev

Visit `http://localhost:3000` — you'll be redirected to `/login`.

## Tradeoffs & Known Limitations

Given the task's tight timeline, the following were deliberately scoped out rather than half-built:

- **No dark mode.** The app forces light mode; system dark-mode preference is intentionally not respected, to avoid shipping inconsistent contrast across components.
- **No signup flow.** Users are provisioned only via the seed script. This matches the brief's evaluation model (seeded accounts) and avoids building account-creation UX that wasn't requested.
- **No tag management UI.** Tags are seeded directly; there's no admin screen to create/edit/delete tags. Filtering by existing tags is fully supported.
- **No real-time updates.** The ticket conversation and dashboard require a page refresh to see changes made by another user in another session. Polling or WebSockets were considered but cut for time.
- **Test coverage is intentionally narrow.** Tests cover RBAC and validation logic only (see "Beyond the Minimum Requirements" above); the service layer, Server Actions, and UI are untested. The most valuable next additions would be an integration test for the full ticket-status-change flow and an ownership check on the comment action, both of which need a test database to do meaningfully.
- **bcrypt (native bindings) rather than bcryptjs.** Worked without issue on Vercel's standard Node runtime during deployment; flagged here in case a future deploy target doesn't support native module compilation.

## Future Improvements

- Real-time ticket updates via polling or WebSockets
- Email notifications on ticket status change or new comment
- Audit log of status changes and assignments
- SLA tracking (e.g. time-to-first-response, time-to-resolution)
- Tag management UI for agents
- Pagination on the agent dashboard's ticket table for larger datasets
- Integration tests for the service and Server Action layers (requires a test database)
- End-to-end tests with Playwright for the full login → create ticket → comment → resolve flow