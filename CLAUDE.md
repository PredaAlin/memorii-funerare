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

All env vars live in `.env.local` (Next.js) and `.env` (Prisma CLI). Both files must exist — Prisma does not read `.env.local`.

| Variable | Purpose | Where to get it |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string | Neon dashboard |
| `NEXTAUTH_SECRET` | JWT signing secret | `node -e "require('crypto').randomBytes(32).toString('base64')"` |
| `NEXTAUTH_URL` | App base URL | `http://localhost:3000` locally, `https://memorii-funerare.vercel.app` in prod |
| `STRIPE_SECRET_KEY` | Stripe API | dashboard.stripe.com/apikeys |
| `STRIPE_PUBLISHABLE_KEY` | Stripe API | dashboard.stripe.com/apikeys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing | Local: `stripe listen` output. Prod: Stripe dashboard → Webhooks |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob media storage | Vercel dashboard → Storage → Blob |
| `ADMIN_EMAIL` | Server-side admin gate | hardcoded to `alinpreda0711@gmail.com` |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Client-side nav link visibility | same value as `ADMIN_EMAIL` |
| `RESEND_API_KEY` | Transactional email | resend.com dashboard |

After setting `DATABASE_URL`, run `npm run db:push` to create tables, then `npm run db:generate` to (re)generate the Prisma client.

### Local webhook testing

The `STRIPE_WEBHOOK_SECRET` differs between local and production. To test locally:

1. Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Copy the `whsec_...` it prints into `.env.local`
3. Restart the dev server (env vars are read at startup)
4. The production `whsec_...` lives only in Vercel env vars

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
| `/dashboard` | Dynamic SSR | Server component, fetches current user's orders from DB |
| `/admin` | Dynamic SSR | Admin-only, fetches all orders from DB |
| `/auth/signin` | Client | Combined sign-in/sign-up form |

### State management

All cart state lives in `contexts/CartContext.tsx` — a client-side context that persists to `localStorage` under keys `em_cart` and `em_shipping`. There is no server-side cart session.

Media (photos/videos) is stored as **base64 data URLs** in cart state until checkout. At order creation (`POST /api/orders`), base64 strings are uploaded to Vercel Blob and stored as URLs in the DB.

### Key files

- `app/layout.tsx` — Root layout with `Providers` (SessionProvider + CartProvider), Navigation, and footer. Uses `next/font/google` for Cinzel + Inter.
- `contexts/CartContext.tsx` — Cart state, shipping info, validation logic, localStorage sync
- `components/Providers.tsx` — Client wrapper for NextAuth + Cart providers
- `components/Navigation.tsx` — Hides on `/memorial/*` routes. Shows Admin link only when `session.user.email === NEXT_PUBLIC_ADMIN_EMAIL`
- `components/PricingSection.tsx` — Client component for "Add to Cart" buttons (only interactive part of home page)
- `components/MemorialEditor.tsx` — Tabbed editor with Details, Media, and Videos tabs
- `components/MemorialView.tsx` — Public memorial content (used in the SSR `/memorial/[id]` page)
- `components/MemorialPreview.tsx` — Phone-frame preview wrapper (used in `/preview`)
- `app/admin/page.tsx` — Admin console: all orders, QR codes, shipping info
- `app/admin/StatusSelect.tsx` — Client component dropdown to update order status in place
- `lib/auth.ts` — NextAuth v4 config (JWT strategy, credentials provider)
- `lib/db.ts` — Prisma singleton (global pattern to avoid connection leaks in dev)
- `lib/stripe.ts` — Lazy Stripe client (`getStripe()` function, not module-level constant)
- `lib/email.ts` — Resend email helpers: `sendPaymentConfirmation`, `sendAdminNewOrder`, `sendShippedNotification`, `buildOrderEmailData`
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
| `POST /api/webhooks/stripe` | Stripe sig | Marks orders paid, publishes memorials, sends confirmation emails |
| `PATCH /api/admin/orders/[id]` | Admin only | Update order status; sends shipped email when status → `shipped` |

### Admin access

Admin routes are protected by checking `session.user.email === process.env.ADMIN_EMAIL` server-side. The nav link uses `NEXT_PUBLIC_ADMIN_EMAIL` (same value) for client-side visibility. Both env vars must match. Accessing `/admin` without the correct email redirects to sign-in.

### Email flow (Resend)

Three transactional emails are sent via `lib/email.ts`:

| Trigger | Recipients | Template |
|---|---|---|
| Stripe `checkout.session.completed` webhook | Customer + Admin | Payment confirmation + new order notification |
| Admin changes order status → `shipped` | Customer | Shipping notification |

**Critical pattern:** emails in the webhook are wrapped in `Promise.allSettled` so Resend failures never cause a webhook 500 (which would trigger Stripe retries). The shipped email in the PATCH route is fire-and-forget (`.catch` only logs).

Use `buildOrderEmailData(order)` from `lib/email.ts` to map a Prisma order+memorial object to `OrderEmailData` — do not inline this mapping again.

### QR codes

QR codes are generated on the fly via `https://api.qrserver.com/v1/create-qr-code/?data=...&size=200x200&margin=10`. They encode the full memorial URL (`NEXTAUTH_URL/memorial/[id]`). No QR library is installed. Both `/dashboard` and `/admin` define a local `memorialUrl(id)` and `qrUrl(id)` helper — these are intentionally local (one-liners, no shared state needed).

### Checkout flow

1. User adds plan(s) to cart (no auth required)
2. Cart page: fill shipping form + set up memorial via editor → "Proceed to Payment"
3. Checkout page (`/checkout`): `POST /api/orders` — base64 media uploaded to Blob, records created in DB, Stripe session created
4. User completes Stripe hosted checkout → redirect to `/success?session_id=xxx`
5. Stripe webhook fires → orders marked paid, memorials published, confirmation emails sent
6. `/dashboard` shows the memorial with QR code; `/admin` shows all orders

The cart validates that all memorial pages are configured before allowing checkout ("PLEASE COMPLETE ALL FORMS AND MEMORIAL PAGES").

### Plans

- **Basic** ($49.99) — photos only, 100MB simulated storage, 10-year hosting
- **Premium** ($89.99) — photos + videos, 300MB simulated storage, lifetime hosting

Prices are defined in `contexts/CartContext.tsx` (`PRICES` constant).

## Deployment

- **Platform:** Vercel (connected to GitHub repo `PredaAlin/memorii-funerare`, auto-deploys on push to `main`)
- **Database:** Neon PostgreSQL (cloud, accessible from both local dev and Vercel)
- **Media:** Vercel Blob
- **Emails:** Resend (`onboarding@resend.dev` sender — works for testing; needs verified domain for unrestricted production sending)
- **Production URL:** `https://memorii-funerare.vercel.app`

All env vars must be set in Vercel dashboard as well as `.env.local`. The `.env` file (Prisma-only, gitignored) only needs `DATABASE_URL` locally.

## Migration history

This project was originally a single-file Vite + React app (`index.tsx` + `index.html`). It was migrated to Next.js 15 App Router in one session. The following files were deleted during migration: `index.tsx`, `index.html`, `vite.config.ts`, `services/geminiService.ts`. Tailwind moved from CDN (`<script src="https://cdn.tailwindcss.com">`) to a proper package install.

## Known gotchas

**Prisma client must be generated before building.** Running `next build` without first running `prisma generate` fails with `@prisma/client did not initialize yet`. This happens any time `prisma/schema.prisma` is changed. Run `npm run db:generate` after every schema change.

**Do not import Prisma types directly from `@prisma/client` in page/component files.** The generated types are only reliably available after `prisma generate`. Use `Awaited<ReturnType<typeof db.model.findFirst>>` to infer types instead — see `app/dashboard/page.tsx` for the pattern.

**Stripe client must stay lazy.** `lib/stripe.ts` exports `getStripe()` (a function), not a `stripe` constant. A module-level `new Stripe(...)` causes `next build` to fail during the "collecting page data" phase when `STRIPE_SECRET_KEY` is not set, because Next.js imports all route modules at build time. Always call `getStripe()` inside route handlers.

**Next.js 15 route params are async.** Dynamic route params are typed as `Promise<{ id: string }>` and must be awaited: `const { id } = await params`. See `app/memorial/[id]/page.tsx` and `app/api/memorials/[id]/route.ts`.

**Stripe API version is `2025-02-24.acacia`.** This is the version the installed `stripe` package's TypeScript types support. Do not change it to a newer string without upgrading the package.

**The `no-scrollbar` utility class** is defined in `app/globals.css` as a custom CSS rule. It is used in `MemorialEditor` and `MemorialPreview` — do not remove it.

**Prisma reads `.env`, not `.env.local`.** Next.js reads both, but the Prisma CLI (`db:push`, `db:studio`, etc.) only reads `.env`. Keep `DATABASE_URL` in both files.

**Dev server must be restarted after `.env.local` changes.** Next.js does not hot-reload environment variables. Kill the server and run `npm run dev` again after adding or changing any env var.
