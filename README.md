# Eternal Memories

QR memorial plaques linked to digital memorial pages. Next.js 15 (App Router),
TypeScript, Tailwind, Prisma/PostgreSQL, NextAuth, Stripe, Vercel Blob, Resend.

## Run locally

**Prerequisites:** Node.js, a PostgreSQL database (Neon).

1. Install dependencies: `npm install`
2. Create `.env.local` and `.env` with the required variables (see the table in
   [CLAUDE.md](CLAUDE.md) → Environment Setup). Prisma reads `.env`; Next.js reads both.
3. Apply the schema: `npm run db:push`
4. Run the app: `npm run dev` → http://localhost:3000

See [CLAUDE.md](CLAUDE.md) for architecture, env vars, and deployment notes.
