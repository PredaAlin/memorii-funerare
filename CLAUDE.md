# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install           # Install dependencies
npm run dev           # Start dev server at http://localhost:3000
npm run build         # Type-check + production build
npm run start         # Run production server
npm run db:push       # Apply schema to database (requires DATABASE_URL)
npm run db:studio     # Open Prisma Studio GUI
npm run db:generate   # Regenerate Prisma client after schema changes
```

There are no test or lint scripts configured.

## Environment Setup

Copy `.env.example` to `.env.local` and fill in all values before running the app:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — random string (`openssl rand -base64 32`)
- `NEXTAUTH_URL` — app base URL (e.g. `http://localhost:3000`)
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET`
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob token (from Vercel dashboard → Storage → Blob)

After setting `DATABASE_URL`, run `npm run db:push` to create tables, then `npm run db:generate` to (re)generate the Prisma client.

## Architecture

This is a **Next.js 15 App Router** app (TypeScript, Tailwind CSS v3, React 19). No test runner or linter is configured.

### Routing & rendering strategy

| Route | Type | Notes |
|---|---|---|
| `/` | Static SSR | Server component, pricing section is a client component |
| `/cart` | Client | All cart state lives in CartContext |
| `/editor?id=xxx` | Client | Reads cart item by ID from CartContext |
| `/preview?id=xxx` | Client | Phone-mockup preview |
| `/checkout` | Client | Redirects to Stripe Checkout |
| `/success` | Client | Clears cart after Stripe redirect |
| `/memorial/[id]` | **Dynamic SSR** | Key feature — server-rendered for QR scan visitors, no JS wait |
| `/dashboard` | Dynamic SSR | Server component, fetches orders from DB |
| `/auth/signin` | Client | Combined sign-in/sign-up form |

### State management

All cart state lives in `contexts/CartContext.tsx` — a client-side context that persists to `localStorage` under keys `em_cart` and `em_shipping`. There is no server-side cart session.

Media (photos/videos) is stored as **base64 data URLs** in cart state until checkout. At order creation (`POST /api/orders`), base64 strings are uploaded to Vercel Blob and stored as URLs in the DB.

### Key files

- `app/layout.tsx` — Root layout with `Providers` (SessionProvider + CartProvider), Navigation, and footer. Uses `next/font/google` for Cinzel + Inter.
- `contexts/CartContext.tsx` — Cart state, shipping info, validation logic, localStorage sync
- `components/Providers.tsx` — Client wrapper for NextAuth + Cart providers
- `components/Navigation.tsx` — Hides on `/memorial/*` routes
- `components/PricingSection.tsx` — Client component for "Add to Cart" buttons (only interactive part of home page)
- `components/MemorialEditor.tsx` — Tabbed editor with Details, Media, and Videos tabs
- `components/MemorialView.tsx` — Public memorial content (used in the SSR `/memorial/[id]` page)
- `components/MemorialPreview.tsx` — Phone-frame preview wrapper (used in `/preview`)
- `lib/auth.ts` — NextAuth v4 config (JWT strategy, credentials provider)
- `lib/db.ts` — Prisma singleton (global pattern to avoid connection leaks in dev)
- `lib/stripe.ts` — Lazy Stripe client (`getStripe()` function, not module-level constant)
- `prisma/schema.prisma` — `User`, `Memorial`, `Order` + NextAuth tables (`Account`, `Session`, `VerificationToken`)
- `types/next-auth.d.ts` — Adds `user.id` to the NextAuth Session type

### API routes

| Route | Auth | Purpose |
|---|---|---|
| `POST /api/auth/register` | — | Create account (email + bcrypt password) |
| `GET/POST /api/auth/[...nextauth]` | — | NextAuth handler |
| `GET/POST /api/memorials` | Required | List / create memorials |
| `GET/PATCH /api/memorials/[id]` | Owner only | Read / update a memorial |
| `POST /api/orders` | Required | Upload media → create Memorial + Order → return Stripe Checkout URL |
| `POST /api/webhooks/stripe` | Stripe sig | On payment, set `order.status = 'paid'` and `memorial.isPublished = true` |

### Checkout flow

1. User adds plan(s) to cart (no auth required)
2. Cart page: fill shipping form → "Proceed to Payment" navigates to `/checkout`
3. Checkout page: `POST /api/orders` — base64 media uploaded to Blob, records created in DB, Stripe session created
4. User completes Stripe hosted checkout → redirect to `/success?session_id=xxx`
5. Stripe webhook: marks orders paid, publishes memorials
6. `/dashboard` shows the memorial with a generated QR code pointing to `/memorial/[id]`

### Plans

- **Basic** ($49.99) — photos only, 100MB simulated storage, 10-year hosting
- **Premium** ($89.99) — photos + videos, 300MB simulated storage, lifetime hosting

Prices are defined in `contexts/CartContext.tsx` (`PRICES` constant).

## Migration history

This project was originally a single-file Vite + React app (`index.tsx` + `index.html`). It was migrated to Next.js 15 App Router in one session. The following files were deleted during migration: `index.tsx`, `index.html`, `vite.config.ts`, `services/geminiService.ts`. Tailwind moved from CDN (`<script src="https://cdn.tailwindcss.com">`) to a proper package install.

## Known gotchas

**Prisma client must be generated before building.** Running `next build` without first running `prisma generate` fails with `@prisma/client did not initialize yet`. This happens any time `prisma/schema.prisma` is changed. Run `npm run db:generate` after every schema change.

**Do not import Prisma types directly from `@prisma/client` in page/component files.** The generated types are only reliably available after `prisma generate`. Use `Awaited<ReturnType<typeof db.model.findFirst>>` to infer types instead — see `app/dashboard/page.tsx` for the pattern.

**Stripe client must stay lazy.** `lib/stripe.ts` exports `getStripe()` (a function), not a `stripe` constant. A module-level `new Stripe(...)` causes `next build` to fail during the "collecting page data" phase when `STRIPE_SECRET_KEY` is not set, because Next.js imports all route modules at build time. Always call `getStripe()` inside route handlers.

**Next.js 15 route params are async.** Dynamic route params are typed as `Promise<{ id: string }>` and must be awaited: `const { id } = await params`. See `app/memorial/[id]/page.tsx` and `app/api/memorials/[id]/route.ts`.

**Stripe API version is `2025-02-24.acacia`.** This is the version the installed `stripe` package's TypeScript types support. Do not change it to a newer string without upgrading the package.

**The `no-scrollbar` utility class** is defined in `app/globals.css` as a custom CSS rule. It is used in `MemorialEditor` and `MemorialPreview` — do not remove it.
