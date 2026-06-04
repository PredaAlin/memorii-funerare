# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install           # Install dependencies — also runs prisma generate (postinstall)
npm run dev           # Start dev server at http://localhost:3000
npm run build         # prisma generate + type-check + production build
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
| `NEXTAUTH_URL` | App base URL | `http://localhost:3000` locally, `https://eternalmemories.ro` in prod |
| `STRIPE_SECRET_KEY` | Stripe API | dashboard.stripe.com/apikeys |
| `STRIPE_PUBLISHABLE_KEY` | Stripe API | dashboard.stripe.com/apikeys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing | Local: `stripe listen` output. Prod: Stripe dashboard → Webhooks |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob media storage | Vercel dashboard → Storage → Blob |
| `ADMIN_EMAIL` | Server-side admin gate | hardcoded to `alinpreda0711@gmail.com` |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Client-side nav link visibility | same value as `ADMIN_EMAIL` |
| `RESEND_API_KEY` | Transactional email | resend.com dashboard |
| `GOOGLE_CLIENT_ID` | Google OAuth | Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | Google Cloud Console → APIs & Services → Credentials |

After setting `DATABASE_URL`, run `npm run db:push` to create tables, then `npm run db:generate` to (re)generate the Prisma client.

### Google OAuth setup

Create credentials at Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID (Web application). Add these **Authorized redirect URIs**:

- `http://localhost:3000/api/auth/callback/google` (local)
- `https://eternalmemories.ro/api/auth/callback/google` (production)

Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in both `.env.local` and Vercel env vars. Restart dev server after adding locally.

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
| `/checkout` | Client | Payment method selector (card → Stripe, ramburs → direct); creates order |
| `/success` | Client | Clears cart; shows ramburs note when `?ramburs=1` |
| `/memorial/[id]` | **Dynamic SSR** | Key feature — server-rendered for QR scan visitors, no JS wait |
| `/dashboard` | Dynamic SSR | Server component, fetches current user's orders from DB |
| `/admin` | Dynamic SSR | Admin-only, fetches all orders from DB |
| `/auth/signin` | Client | Combined sign-in/sign-up form |
| `/reviews` | Dynamic SSR | Public reviews list; checks session to show write/edit buttons |
| `/reviews/write` | Dynamic SSR | Server-validates order eligibility; handles both create and edit |

### State management

All cart state lives in `contexts/CartContext.tsx` — a client-side context that persists to `localStorage` under keys `em_cart` and `em_shipping`. There is no server-side cart session.

Media (photos/videos) is stored as **base64 data URLs** in cart state until checkout. At order creation (`POST /api/orders`), base64 strings are uploaded to Vercel Blob and stored as URLs in the DB.

### Key files

- `app/layout.tsx` — Root layout with `Providers` (SessionProvider + CartProvider), Navigation, footer, and Organization JSON-LD schema. Uses `next/font/google` for Cinzel + Inter.
- `contexts/CartContext.tsx` — Cart state, shipping info, validation logic, localStorage sync
- `components/Providers.tsx` — Client wrapper for NextAuth + Cart providers
- `components/Navigation.tsx` — Hides on `/memorial/*` routes. Shows Admin link only when `session.user.email === NEXT_PUBLIC_ADMIN_EMAIL`. Responsive: full link row on `md+`, hamburger dropdown on mobile.
- `components/PricingSection.tsx` — Client component for "Add to Cart" buttons (only interactive part of home page)
- `components/MemorialEditor.tsx` — Tabbed editor with Detalii, Temă, Media, and Videoclipuri tabs
- `components/MemorialView.tsx` — Public memorial content (used in the SSR `/memorial/[id]` page); applies theme via inline styles
- `components/MemorialPreview.tsx` — Phone-frame preview wrapper (used in `/preview`); applies theme via inline styles
- `lib/themes.ts` — Theme definitions (`THEMES` array, `getTheme(id)` helper). Five themes: `clasic`, `noapte`, `natura`, `serenitate`, `vintage`. Each exports a `colors` object used directly as inline styles in `MemorialView` and `MemorialPreview`.
- `app/admin/page.tsx` — Thin server shell: auth check, DB fetch, date serialization, renders `AdminDashboard`
- `app/admin/AdminDashboard.tsx` — Client component: period filter (Azi/Această lună/Acest an/Toate), orders chart, 4 stat cards (revenue, total, de expediat, livrate), status filter pills, filtered orders list. Stats and chart update live when status changes or orders are deleted. Ramburs orders show an amber "Ramburs" badge. Each order card has an inline-confirm delete button.
- `app/admin/OrdersChart.tsx` — Bar chart (Recharts) showing orders grouped by day (Săptămână/Lună) or by month (An). Data is aggregated client-side from the orders already in state — no extra DB query.
- `app/admin/StatusSelect.tsx` — Client component dropdown to update order status in place; accepts optional `onChange` callback so parent dashboard can sync stats
- `lib/auth.ts` — NextAuth v4 config (JWT strategy, credentials provider + Google OAuth)
- `lib/db.ts` — Prisma singleton (global pattern to avoid connection leaks in dev)
- `lib/stripe.ts` — Lazy Stripe client (`getStripe()` function, not module-level constant)
- `lib/email.ts` — Resend email helpers: `sendPaymentConfirmation`, `sendAdminNewOrder`, `sendShippedNotification`, `sendAdminShippedQR`, `sendDeliveredNotification`, `buildOrderEmailData`
- `prisma/schema.prisma` — `User`, `Memorial`, `Order`, `Review` + NextAuth tables. `Memorial` has `theme String @default("clasic")`. `Order` has `paymentMethod String @default("card")` (`"card"` | `"ramburs"`). `Review` has `orderId @unique` (one review per order) with cascade deletes on both `userId` and `orderId`.
- `app/reviews/page.tsx` — Dynamic SSR: public reviews list with avg rating, seed reviews, "Scrie o recenzie" button (only when session user has an eligible delivered order), "Editează" link on own reviews
- `app/reviews/write/page.tsx` — Server shell: auth check, order eligibility check; if review already exists passes it as `existing` prop to `ReviewForm` (edit mode), otherwise create mode
- `app/reviews/write/ReviewForm.tsx` — Client component: interactive star picker, textarea, POST to `/api/reviews` (create) or PATCH to `/api/reviews/[id]` (edit); detects mode via `existing` prop
- `app/sitemap.ts` — Auto-generates `/sitemap.xml` with homepage and reviews page
- `app/robots.ts` — Auto-generates `/robots.txt`; disallows `/admin`, `/dashboard`, `/api/`, `/checkout`, `/success`, `/editor`, `/preview`
- `app/opengraph-image.tsx` — Edge runtime dynamic OG image (1200×630, dark stone background with logo and tagline)
- `app/icon.svg` — Favicon: diamond/square logo matching the navbar, dark background with amber inner square
- `public/gravestone.jpg` — Local cemetery photo (1400×930, 199KB JPEG); used on homepage via Next.js `<Image>`
- `types/next-auth.d.ts` — Adds `user.id` to the NextAuth Session type

### API routes

| Route | Auth | Purpose |
|---|---|---|
| `POST /api/auth/register` | — | Create account (email + bcrypt password) |
| `GET/POST /api/auth/[...nextauth]` | — | NextAuth handler |
| `GET/POST /api/memorials` | Required | List / create memorials |
| `GET/PATCH /api/memorials/[id]` | Owner only | Read / update a memorial |
| `POST /api/orders` | Required | Upload media → create Memorial + Order → for `card`: return Stripe Checkout URL; for `ramburs`: publish memorial immediately, set status `paid`, send emails, return `/success?ramburs=1` |
| `POST /api/webhooks/stripe` | Stripe sig | Marks card orders paid, publishes memorials, sends confirmation emails (ramburs orders are never touched here — no `stripeSessionId`) |
| `PATCH /api/admin/orders/[id]` | Admin only | Update order status; on → `shipped` sends customer notification + admin QR email; on → `delivered` sends customer thank-you + review link |
| `DELETE /api/admin/orders/[id]` | Admin only | Delete order (cascades to Review) then deletes the associated Memorial |
| `GET /api/reviews` | — | Public list of all reviews (author anonymised to first name + initial) |
| `POST /api/reviews` | Required | Submit review — validates delivered order ownership, one per order |
| `PATCH /api/reviews/[id]` | Owner only | Edit existing review — validates ownership before updating rating + body |

### Admin access

Admin routes are protected by checking `session.user.email === process.env.ADMIN_EMAIL` server-side. The nav link uses `NEXT_PUBLIC_ADMIN_EMAIL` (same value) for client-side visibility. Both env vars must match. Accessing `/admin` without the correct email redirects to sign-in.

### Email flow (Resend)

Five transactional email triggers via `lib/email.ts`:

| Trigger | Recipients | Template |
|---|---|---|
| Ramburs order creation (`POST /api/orders`) | Customer + Admin | Confirmation (notes "vei achita la livrare") + admin new-order (subject tagged `[RAMBURS]`) |
| Stripe `checkout.session.completed` webhook | Customer + Admin | Payment confirmation + new order notification |
| Admin changes order status → `shipped` | Customer | Shipping notification |
| Admin changes order status → `shipped` | Admin | QR code PNG attached (`qr-<name>.png`) + memorial URL + shipping address |
| Admin changes order status → `delivered` | Customer | Thank-you + review request with link to `/reviews/write?orderId=xxx` |

**Critical pattern:** emails in the webhook are wrapped in `Promise.allSettled` so Resend failures never cause a webhook 500 (which would trigger Stripe retries). Ramburs confirmation emails are also wrapped in `Promise.allSettled`. All emails in the admin PATCH route are fire-and-forget (`.catch` only logs).

`sendPaymentConfirmation` and `sendAdminNewOrder` both accept `paymentMethod` via `OrderEmailData` and adjust their wording accordingly.

Use `buildOrderEmailData(order)` from `lib/email.ts` to map a Prisma order+memorial object to `OrderEmailData` — do not inline this mapping again.

### QR codes

QR codes are generated on the fly via `https://api.qrserver.com/v1/create-qr-code/?data=...&size=200x200&margin=10`. They encode the full memorial URL (`NEXTAUTH_URL/memorial/[id]`). No QR library is installed. Both `/dashboard` and `/admin` define a local `memorialUrl(id)` and `qrUrl(id)` helper — these are intentionally local (one-liners, no shared state needed).

The admin shipped QR email uses size `400x400` and fetches the PNG as a buffer to attach to the email via Resend's `attachments` field.

### Reviews system

- Only users with a `delivered` order can write a review (validated server-side on both the page and the API)
- One review per order (`orderId @unique` in schema)
- Author anonymised to "Prenume I." in public display
- `/reviews` page includes 3 hardcoded seed reviews (`SEED_REVIEWS` constant) so the page is never empty
- The "Scrie o recenzie" button on `/reviews` only renders when the signed-in user has an eligible delivered order with no review yet; it pre-fills `?orderId=xxx`
- Users can edit their own review via the "Editează" link on their card; `/reviews/write?orderId=xxx` detects the existing review and switches to edit mode
- The `sendDeliveredNotification` email includes a direct link to `/reviews/write?orderId=xxx`

### Checkout flow

1. User adds plan(s) to cart (no auth required)
2. Cart page: fill shipping form + set up memorial via editor → "Continuă la Plată"
3. Checkout page (`/checkout`): user selects payment method — **card** or **ramburs** — then `POST /api/orders` with `paymentMethod`

**Card path:**
- Base64 media uploaded to Blob, Memorial + Order created (`status: 'pending'`, `isPublished: false`)
- Stripe Checkout session created → user redirected to Stripe
- Stripe webhook fires → orders marked `paid`, memorials published, confirmation emails sent
- `/success?session_id=xxx`

**Ramburs path:**
- Same media upload + record creation, but `status: 'paid'`, `isPublished: true` immediately
- Confirmation emails sent on the spot (wrapped in `Promise.allSettled`)
- `/success?ramburs=1` — shows "Vei achita suma curierului la primirea coletului." note

4. `/dashboard` shows the memorial with QR code; `/admin` shows all orders with a Ramburs badge on COD orders

The cart validates that all memorial pages are configured before allowing checkout.

### Plans

- **Memorial de Bază** (149.99 lei) — photos only, 100MB simulated storage, 10-year hosting
- **Moștenire Premium** (199.99 lei) — photos + videos, 300MB simulated storage, lifetime hosting

Prices are defined in `contexts/CartContext.tsx` (`PRICES` constant). Currency is RON (`'ron'`) in the Stripe checkout session.

### Themes

Memorial pages support five visual themes selectable in the editor's "Temă" tab:

| ID | Name | Character |
|---|---|---|
| `clasic` | Clasic | White background, stone/amber palette (default) |
| `noapte` | Noapte | Dark slate, gold accents |
| `natura` | Natură | Warm off-white, sage green |
| `serenitate` | Serenitate | Light blue, deep navy text |
| `vintage` | Vintage | Warm cream/parchment, terracotta accents |

Themes are implemented as inline CSS styles (not Tailwind classes) so all color variants are available at runtime without a Tailwind purge concern. The `theme` value is stored in `MemorialContent.theme` (cart/editor), persisted to `Memorial.theme` in the DB, and read by both `MemorialPreview` and `MemorialView` via `getTheme()` from `lib/themes.ts`. To add a new theme, add an entry to the `THEMES` array in `lib/themes.ts` — no other changes needed.

### SEO

- **Metadata:** root layout sets title template (`%s | Eternal Memories`), description, OG, Twitter card, `lang="ro"`, `metadataBase`. Pages override with page-specific titles/descriptions.
- **JSON-LD schemas:** Organization in root layout; Product + ItemList on homepage; AggregateRating on `/reviews` (uses live + seed data)
- **Sitemap:** `app/sitemap.ts` → auto-served at `/sitemap.xml`
- **Robots:** `app/robots.ts` → auto-served at `/robots.txt`; private routes are disallowed
- **OG image:** `app/opengraph-image.tsx` (edge runtime, 1200×630)
- **Favicon:** `app/icon.svg` (Next.js picks up automatically)
- **Google Search Console:** domain verified via DNS TXT record (managed in Vercel DNS). Sitemap submitted at `https://eternalmemories.ro/sitemap.xml`.

## Deployment

- **Platform:** Vercel (connected to GitHub repo `PredaAlin/memorii-funerare`, auto-deploys on push to `main`)
- **Custom domain:** `eternalmemories.ro` — DNS managed via Vercel nameservers (ns1/ns2.vercel-dns.com set in ROTLD). `www` redirects to apex.
- **Database:** Neon PostgreSQL (cloud, accessible from both local dev and Vercel)
- **Media:** Vercel Blob
- **Emails:** Resend (`onboarding@resend.dev` sender — works for testing; needs verified domain for unrestricted production sending)
- **Production URL:** `https://eternalmemories.ro`

All env vars must be set in Vercel dashboard as well as `.env.local`. The `.env` file (Prisma-only, gitignored) only needs `DATABASE_URL` locally.

## Migration history

This project was originally a single-file Vite + React app (`index.tsx` + `index.html`). It was migrated to Next.js 15 App Router in one session. The following files were deleted during migration: `index.tsx`, `index.html`, `vite.config.ts`, `services/geminiService.ts`. Tailwind moved from CDN (`<script src="https://cdn.tailwindcss.com">`) to a proper package install.

## Known gotchas

**Prisma client must be generated before building.** A `postinstall` script runs `prisma generate` after every `npm install`, and the `build` script runs it again explicitly. Both are needed: Vercel calls `next build` directly (bypassing the `build` script), so only `postinstall` guarantees fresh types there. Locally, run `npm run db:generate` after every schema change — but stop the dev server first, since it holds the `.node` binary and the rename will fail with `EPERM` while it is running.

**Do not import Prisma types directly from `@prisma/client` in page/component files.** The generated types are only reliably available after `prisma generate`. Use `Awaited<ReturnType<typeof db.model.findFirst>>` to infer types instead — see `app/dashboard/page.tsx` for the pattern.

**Serialize Dates before passing from server to client components.** Prisma returns `Date` objects; Next.js serializes them to ISO strings when crossing the server→client boundary. Define client-side interfaces with `createdAt: string` and call `.toISOString()` in the server component before passing. See `app/admin/page.tsx` for the pattern.

**Stripe client must stay lazy.** `lib/stripe.ts` exports `getStripe()` (a function), not a `stripe` constant. A module-level `new Stripe(...)` causes `next build` to fail during the "collecting page data" phase when `STRIPE_SECRET_KEY` is not set, because Next.js imports all route modules at build time. Always call `getStripe()` inside route handlers.

**Next.js 15 route params are async.** Dynamic route params are typed as `Promise<{ id: string }>` and must be awaited: `const { id } = await params`. See `app/memorial/[id]/page.tsx` and `app/api/memorials/[id]/route.ts`.

**Stripe API version is `2025-02-24.acacia`.** This is the version the installed `stripe` package's TypeScript types support. Do not change it to a newer string without upgrading the package.

**The `no-scrollbar` utility class** is defined in `app/globals.css` as a custom CSS rule. It is used in `MemorialEditor` and `MemorialPreview` — do not remove it.

**Prisma reads `.env`, not `.env.local`.** Next.js reads both, but the Prisma CLI (`db:push`, `db:studio`, etc.) only reads `.env`. Keep `DATABASE_URL` in both files.

**Dev server must be restarted after `.env.local` changes.** Next.js does not hot-reload environment variables. Kill the server and run `npm run dev` again after adding or changing any env var.

**Deleting a User from the database requires manually deleting their Orders first.** `Account`, `Session`, and `Memorial` all have `onDelete: Cascade` on their `userId` foreign key, so they clean up automatically. `Order` does not — deleting a `User` who has orders will fail with a foreign key violation. Safe deletion order via Neon SQL Editor:
```sql
DELETE FROM "Order" WHERE "userId" = '<user-id>';
DELETE FROM "User" WHERE id = '<user-id>';
```

**Use JPEG not PNG for large static images.** A 2.2MB PNG in `public/` caused `INVALID_IMAGE_OPTIMIZE_REQUEST` on Vercel's image optimization. Convert large images to JPEG before committing: `node -e "require('sharp')('public/img.png').resize(1400).jpeg({quality:82}).toFile('public/img.jpg')"`. Sharp is available as a Next.js dependency.

**Terminology: use "Memorial" not "Memoriu".** All user-facing strings use "Memorial" (e.g. "Memorial de Bază", "Memorial fără titlu", "Memorialele mele"). Do not reintroduce the old "Memoriu" spelling.
