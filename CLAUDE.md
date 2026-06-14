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
| `/cart` | Client | All cart state lives in CartContext. Previzualizare button opens inline `MemorialPreview` modal. "Salvează Memorial" in editor redirects here with `?saved=1` toast. Cart item shows **profile photo thumbnail** when one has been set (falls back to QR placeholder SVG). Bottom of items list has an **"Adaugă un alt memorial"** strip with Basic/Premium buttons — calls `addToCart(plan)` and redirects to `/editor?id=<newId>`. |
| `/editor?id=xxx` | Client | Reads cart item by ID from CartContext. On save → redirects to `/cart?saved=1` |
| `/preview?id=xxx` | ~~deleted~~ | Was the phone-mockup preview page — removed; replaced by inline modals in the cart and editor |
| `/checkout` | Client | Payment method selector (card → Stripe, ramburs → direct); creates order |
| `/success` | Client | Clears cart; shows ramburs note when `?ramburs=1` |
| `/memorial/[id]` | **Dynamic SSR** | Key feature — server-rendered for QR scan visitors, no JS wait |
| `/edit/[id]` | Dynamic SSR | Auth-gated; server fetches memorial, passes to `EditForm` client component for edit-after-purchase |
| `/dashboard` | Dynamic SSR | Server component, fetches current user's orders from DB |
| `/admin` | Dynamic SSR | Admin-only, fetches all orders from DB |
| `/auth/signin` | Client | Combined sign-in/sign-up form |
| `/reviews` | Dynamic SSR | Public reviews list; checks session to show write/edit buttons |
| `/reviews/write` | Dynamic SSR | Server-validates order eligibility; handles both create and edit |

### State management

All cart state lives in `contexts/CartContext.tsx` — a client-side context that persists to `localStorage` under keys `em_cart` and `em_shipping`. There is no server-side cart session.

Media (photos/videos) is **uploaded directly from the browser to Vercel Blob** when the user selects a file in the editor, using `upload()` from `@vercel/blob/client`. Images are canvas-compressed first (in the browser), then uploaded client-side. Videos upload client-side without compression. The `/api/upload` route is a token handshake only — no file data passes through it — so Vercel's 4.5MB function payload limit is never hit regardless of file size. Only the resulting Blob URL is stored in cart state. At order creation (`POST /api/orders`), `uploadIfBase64` detects that the values are already URLs and skips re-uploading. This avoids the ~5MB `localStorage` quota limit that base64 storage hit in practice.

### Key files

- `app/layout.tsx` — Root layout with `Providers` (SessionProvider + CartProvider), Navigation, footer, and Organization JSON-LD schema. Uses `next/font/google` for Cinzel + Inter.
- `contexts/CartContext.tsx` — Cart state, shipping info, validation logic, localStorage sync. `addToCart(plan)` returns the new item's ID (string) so callers can redirect straight to the editor.
- `components/Providers.tsx` — Client wrapper for NextAuth + Cart providers
- `components/Navigation.tsx` — Hides on `/memorial/*` routes. Shows Admin link only when `session.user.email === NEXT_PUBLIC_ADMIN_EMAIL`. Responsive: full link row on `md+`, hamburger dropdown on mobile.
- `components/PricingSection.tsx` — Client component for "Add to Cart" buttons (only interactive part of home page)
- `components/MemorialEditor.tsx` — Tabbed editor with Detalii, Temă, Media, Videoclipuri, **Interacțiune**, and **Arbore** tabs. The Interacțiune tab has two toggle switches — **Lumânare virtuală** (`candlesEnabled`) and **Țin minte când** (`memoriesEnabled`) — available on all plans. The **Arbore** tab (Premium-only, gated like Videoclipuri) has an enable toggle (`familyTreeEnabled`) + the `FamilyTreeEditor`. File uploads go directly to Vercel Blob from the browser via `@vercel/blob/client` `upload()` (images are canvas-compressed first); Save button is disabled while uploads are pending. Storage bar tracks **actual file sizes** (`file.size` recorded at upload time; pre-existing files fall back to 2MB/image and 15MB/video estimates). Storage limit is enforced at upload time (per-file check against remaining capacity) and again at save time. Error/info messages use an **inline toast** (auto-dismisses after 4s, has an × button) — no `alert()` calls. Media tab supports **drag-to-reorder** (HTML5 drag-and-drop, six-dot handle, no library). Footer has a **"Previzualizare" button** that opens the `MemorialPreview` phone-frame in a full-screen modal. Accepts optional `saveLabel` prop to customise the save button text.
- `components/MemorialView.tsx` — Public memorial content (used in the SSR `/memorial/[id]` page and the editor's Previzualizare modal). **Client component** with sticky tabbed navigation: Info, Galerie (only when mediaUrls present), Videoclipuri (only when videoUrls present), Amintiri (only when `memoriesEnabled`). When `candlesEnabled`, a **virtual candle widget** sits under the name/dates header (live count + "Aprinde" button; optimistic increment, `localStorage['em_candle_<id>']` one-per-browser dedup). The **family tree renders inside the Info tab** (under an "Arbore genealogic" heading, below the bio) when `familyTreeEnabled` and a tree exists — there is no separate tree tab. The **Amintiri** tab holds the "Țin minte când" submit form + tributes list; when `isOwner` is passed, each tribute shows a "Șterge" delete button. Applies theme via inline styles using `c.text` / `c.textMuted` for name/dates — never hardcoded white.
- `components/MemorialPreview.tsx` — Phone-frame preview wrapper used in inline modals (editor's Previzualizare button and cart's Previzualizare button); applies theme via inline styles. Mirrors `MemorialView`: shows the family tree inside its info view when enabled.
- `components/FamilyTree.tsx` — **Shared themed renderer** (`'use client'`) for the family tree, used read-only on the public page/preview AND interactively in the editor. CSS org-chart with inline-styled connector lines (theme `colors`), couples paired by an accent "marriage" link with children branching from the couple, deceased (`isSelf`) highlighted in the accent color, horizontally scrollable. Optional props `selectedId` / `onSelect` / `renderMenu(id)` enable the interactive editor mode (clickable cards + an inline action menu beneath the selected card). Optional `validMemorialIds` (string[]) — in read-only mode, a person/partner whose `memorialId` is in that list renders as a link (`↗`) to `/memorial/<id>`; otherwise plain text (graceful fallback for unpublished/deleted targets).
- `components/FamilyTreeEditor.tsx` — Click-driven family-tree builder (`'use client'`). Renders `FamilyTree` over a neutral `clasic` palette; clicking a person opens an inline panel with name/relation inputs, a single-select **"Persoana comemorată"** checkbox, four contextual actions — **+ Părinte / + Frate / + Copil / + Partener** — greyed out per constraints (max **2 parents** = a parent node + its spouse; max **1 partner**; siblings disabled until a parent exists; partners can't add their own parents/siblings), and a **🔗 Leagă de un memorial** section (pick from the owner's own published memorials via `GET /api/memorials`, or paste a memorial URL/id verified via `GET /api/memorials/<id>`). Adding a parent to the root wraps it in a new root (tree grows upward). Pure id-keyed immutable tree helpers; backfills missing `spouse.id` on older drafts.
- `components/ImageGalleryCarousel.tsx` — Client component: responsive grid of photos that opens a full-screen lightbox on click; keyboard (←/→/Esc) and touch-swipe navigation; used inside `MemorialView`.
- `components/SiteFooter.tsx` — Client component wrapping the site footer; returns `null` on `/memorial/*` routes so the footer is hidden for QR-scan visitors. Same `usePathname()` pattern as `Navigation`.
- `lib/themes.ts` — Theme definitions (`THEMES` array, `getTheme(id)` helper). Ten themes: `clasic`, `noapte`, `natura`, `serenitate`, `vintage`, `aurora`, `smarald`, `trandafir`, `lavanda`, `apus`. Each exports a `colors` object used directly as inline styles in `MemorialView` and `MemorialPreview`.
- `app/edit/[id]/page.tsx` — Server component: auth check, ownership check, DB fetch, passes data to `EditForm`
- `app/edit/[id]/EditForm.tsx` — Client component: maps DB memorial → `MemorialContent`, renders `MemorialEditor` with `saveLabel="Actualizează Memorialul"`, calls `PATCH /api/memorials/[id]` on save, then redirects to `/dashboard?saved=1`
- `app/dashboard/SavedToast.tsx` — Client component: reads `?saved=1` from URL via `useSearchParams`, shows green success toast, then calls `router.replace('/dashboard')` to clean the URL. Must be wrapped in `<Suspense>` in the dashboard page.
- `app/admin/page.tsx` — Thin server shell: auth check, DB fetch, date serialization, renders `AdminDashboard`
- `app/admin/AdminDashboard.tsx` — Client component: period filter (Azi/Această lună/Acest an/Toate), orders chart, 4 stat cards (revenue, total, de expediat, livrate), status filter pills, filtered orders list. Stats and chart update live when status changes or orders are deleted. Ramburs orders show an amber "Ramburs" badge. Each order card has an inline-confirm delete button.
- `app/admin/OrdersChart.tsx` — Bar chart (Recharts) showing orders grouped by day (Săptămână/Lună) or by month (An). Data is aggregated client-side from the orders already in state — no extra DB query.
- `app/admin/StatusSelect.tsx` — Client component dropdown to update order status in place; accepts optional `onChange` callback so parent dashboard can sync stats
- `lib/auth.ts` — NextAuth v4 config (JWT strategy, credentials provider + Google OAuth)
- `lib/db.ts` — Prisma singleton (global pattern to avoid connection leaks in dev)
- `lib/stripe.ts` — Lazy Stripe client (`getStripe()` function, not module-level constant)
- `lib/email.ts` — Resend email helpers: `sendPaymentConfirmation`, `sendAdminNewOrder` (includes QR attachment), `sendShippedNotification`, `sendDeliveredNotification`, `sendNewTributeNotification` (notifies the memorial owner when a visitor leaves an "amintire"), `buildOrderEmailData`
- `prisma/schema.prisma` — `User`, `Memorial`, `Order`, `Review`, `Tribute` + NextAuth tables. `Memorial` has `theme String @default("clasic")`, plus `candlesEnabled`/`memoriesEnabled` (`Boolean @default(true)`), `candleCount Int @default(0)`, `familyTreeEnabled Boolean @default(false)`, and `familyTree Json?` (a nested `FamilyMember` tree; clearing it on PATCH requires `Prisma.DbNull`, not JS `null`). `Tribute` (a visitor-submitted "Țin minte când" memory) has `authorName`, optional `relationship`, `body`, and `memorialId` with `onDelete: Cascade` (deleting a Memorial removes its tributes). `Order` has `paymentMethod String @default("card")` (`"card"` | `"ramburs"`). `Review` has `orderId @unique` (one review per order) with cascade deletes on both `userId` and `orderId`.
- `lib/rateLimit.ts` — Best-effort in-memory IP rate limiter (`rateLimit(key, max, windowMs)` + `clientIp(req)`). Resets on serverless cold start — a soft guard, not a hard boundary. Used by the public candle + tributes POST routes.
- `app/reviews/page.tsx` — Dynamic SSR: public reviews list with avg rating, seed reviews, "Scrie o recenzie" button (only when session user has an eligible delivered order), "Editează" link on own reviews
- `app/reviews/write/page.tsx` — Server shell: auth check, order eligibility check; if review already exists passes it as `existing` prop to `ReviewForm` (edit mode), otherwise create mode
- `app/reviews/write/ReviewForm.tsx` — Client component: interactive star picker, textarea, POST to `/api/reviews` (create) or PATCH to `/api/reviews/[id]` (edit); detects mode via `existing` prop
- `app/sitemap.ts` — Auto-generates `/sitemap.xml` with homepage and reviews page
- `app/robots.ts` — Auto-generates `/robots.txt`; disallows `/admin`, `/dashboard`, `/api/`, `/checkout`, `/success`, `/editor`, `/preview` (note: `/preview` route is deleted but the disallow entry is harmless)
- `app/opengraph-image.tsx` — Edge runtime dynamic OG image (1200×630, dark stone background with logo and tagline)
- `app/icon.svg` — Favicon: diamond/square logo matching the navbar, dark background with amber inner square
- `public/gravestone.jpg` — Local cemetery photo (1400×930, 199KB JPEG); used on homepage via Next.js `<Image>`
- `types/next-auth.d.ts` — Adds `user.id` to the NextAuth Session type
- `app/dashboard/page.tsx` — Shows user's orders; each card has "Editează" (amber, links to `/edit/[memorialId]`) and "Vezi Pagina Publică" buttons; includes `<Suspense><SavedToast /></Suspense>` for post-edit confirmation

### API routes

| Route | Auth | Purpose |
|---|---|---|
| `POST /api/auth/register` | — | Create account (email + bcrypt password) |
| `GET/POST /api/auth/[...nextauth]` | — | NextAuth handler |
| `GET/POST /api/memorials` | Required | List / create memorials |
| `GET/PATCH /api/memorials/[id]` | Owner only | Read / update a memorial. PATCH accepts: `deceasedName`, `birthDate`, `deathDate`, `bio`, `quote`, `mediaUrls`, `videoUrls`, `theme`, `candlesEnabled`, `memoriesEnabled`, `familyTreeEnabled`, `familyTree`, `profilePhotoUrl`, `bannerPhotoUrl` |
| `POST /api/memorials/[id]/candle` | — | Increment the memorial's candle count (public). 404 if unpublished or `candlesEnabled` off; IP rate-limited (10/min) |
| `POST /api/memorials/[id]/tributes` | — | Submit a "Țin minte când" memory (public, auto-published). 404 if unpublished or `memoriesEnabled` off. Validates name ≤60 (blank → "Anonim"), body 1–1000, relationship ≤40; IP rate-limited (3 / 10 min). On success, fire-and-forget `sendNewTributeNotification` to the memorial owner's account email |
| `DELETE /api/memorials/[id]/tributes/[tributeId]` | Owner only | Delete a tribute (owner moderation of bad messages) |
| `POST /api/upload` | — | Client-side upload token handshake only — no file data passes through this function. Uses `handleUpload` from `@vercel/blob/client`. Both images and videos upload directly from the browser to Vercel Blob; the function just issues a signed token. |
| `POST /api/orders` | Required | Create Memorial + Order (media already in Blob as URLs); for `card`: return Stripe Checkout URL; for `ramburs`: publish memorial immediately, set status `paid`, send emails, return `/success?ramburs=1` |
| `POST /api/webhooks/stripe` | Stripe sig | Marks card orders paid, publishes memorials, sends confirmation emails (ramburs orders are never touched here — no `stripeSessionId`) |
| `PATCH /api/admin/orders/[id]` | Admin only | Update order status; on → `shipped` sends customer shipping notification; on → `delivered` sends customer thank-you + review link |
| `DELETE /api/admin/orders/[id]` | Admin only | Delete order (cascades to Review) then deletes the associated Memorial |
| `GET /api/reviews` | — | Public list of all reviews (author anonymised to first name + initial) |
| `POST /api/reviews` | Required | Submit review — validates delivered order ownership, one per order |
| `PATCH /api/reviews/[id]` | Owner only | Edit existing review — validates ownership before updating rating + body |

### Admin access

Admin routes are protected by checking `session.user.email === process.env.ADMIN_EMAIL` server-side. The nav link uses `NEXT_PUBLIC_ADMIN_EMAIL` (same value) for client-side visibility. Both env vars must match. Accessing `/admin` without the correct email redirects to sign-in.

### Email flow (Resend)

Four transactional email triggers via `lib/email.ts`:

| Trigger | Customer | Admin |
|---|---|---|
| Order placed — card (Stripe webhook) | `sendPaymentConfirmation` | `sendAdminNewOrder` + QR PNG attached |
| Order placed — ramburs (`POST /api/orders`) | `sendPaymentConfirmation` (notes "vei achita la livrare") | `sendAdminNewOrder` [RAMBURS] + QR PNG attached |
| Admin changes status → `shipped` | `sendShippedNotification` | — |
| Admin changes status → `delivered` | `sendDeliveredNotification` + review link | — |
| Visitor leaves an "amintire" (`POST /api/memorials/[id]/tributes`) | `sendNewTributeNotification` to the **memorial owner** (account email) | — |

Admin always receives the QR code (`qr-<name>.png`, 400×400) at order creation — not at shipment. This allows engraving to start immediately.

**Sender:** `noreply@eternalmemories.ro` — domain verified in Resend ✓, all transactional emails confirmed working in production. The old `onboarding@resend.dev` sender only delivered to the Resend account owner's address.

**Critical pattern:** emails in the webhook are wrapped in `Promise.allSettled` so Resend failures never cause a webhook 500 (which would trigger Stripe retries). Ramburs confirmation emails use the same pattern. All emails in the admin PATCH route are fire-and-forget (`.catch` only logs).

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

### Visitor interaction (candle & memories)

Two visitor-facing features on the public memorial page, each toggled per memorial by the owner in the editor's Interacțiune tab (`candlesEnabled` / `memoriesEnabled`, both default `true`). The toggles live on `MemorialContent` (cart/editor), flow through `POST /api/orders` and `PATCH /api/memorials/[id]`, and persist to `Memorial`.

- **Lumânare virtuală** — visitors tap "Aprinde" to light a candle; `Memorial.candleCount` increments via `POST /api/memorials/[id]/candle`. Client uses optimistic update + `localStorage['em_candle_<id>']` to mark one-per-browser; server adds a best-effort IP rate-limit. The widget shows the live count under the name/dates header.
- **Țin minte când** (`Tribute` model) — visitors submit a memory (name + optional relationship + message) via `POST /api/memorials/[id]/tributes`. Memories **auto-publish** immediately, and the **memorial owner is emailed** (`sendNewTributeNotification`). The `/memorial/[id]` page detects the owner via `getServerSession` and passes `isOwner` to `MemorialView`; when true, each memory shows a "Șterge" button (`DELETE …/tributes/[tributeId]`) for reactive moderation of bad messages. Blank name defaults to "Anonim".

### Family tree ("Arbore genealogic")

A **Premium-only**, opt-in family tree (`familyTreeEnabled` toggle + `familyTree` nested JSON on `MemorialContent` → `Memorial`). Built in the editor's **Arbore** tab via `FamilyTreeEditor` (click a person → contextual + Părinte / + Frate / + Copil / + Partener with max-2-parents / max-1-partner constraints; tree grows upward by re-rooting). Rendered read-only by the shared `FamilyTree` component **inside the Info tab** of `MemorialView` (and the `MemorialPreview` info view), themed to match, with the deceased highlighted. See the `FamilyTree.tsx` / `FamilyTreeEditor.tsx` key-file entries for details.

**Linking people to memorials:** each tree person/partner can carry an optional `memorialId` so clicking them on the public page opens that memorial. Owners link from the editor — either picking one of their own published memorials, or pasting any published memorial's URL (memorial pages are public, so cross-owner links need no consent; there is deliberately **no global name search**). The public page (`app/memorial/[id]/page.tsx`) collects the tree's `memorialId`s, queries which are still published, and passes `validMemorialIds` down so only live links render (broken ones degrade to plain text). No approval/mutual-link flow.

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
- **Moștenire Premium** (199.99 lei) — photos + videos + family tree, 300MB simulated storage, lifetime hosting

Prices are defined in `contexts/CartContext.tsx` (`PRICES` constant). Currency is RON (`'ron'`) in the Stripe checkout session.

### Themes

Memorial pages support ten visual themes selectable in the editor's "Temă" tab:

| ID | Name | Character |
|---|---|---|
| `clasic` | Clasic | White background, stone/amber palette (default) |
| `noapte` | Noapte | Dark slate, gold accents |
| `natura` | Natură | Warm off-white, sage green |
| `serenitate` | Serenitate | Light blue, deep navy text |
| `vintage` | Vintage | Warm cream/parchment, terracotta accents |
| `aurora` | Aurora | Dark midnight blue, teal/violet accents |
| `smarald` | Smarald | Deep emerald green, gold accents (dark) |
| `trandafir` | Trandafir | Soft blush rose, burgundy text |
| `lavanda` | Lavandă | Lilac background, deep plum text |
| `apus` | Apus | Warm peach/coral, rust text |

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

**Prisma client must be generated before building.** A `postinstall` script runs `prisma generate` after every `npm install`, and both `build` and `vercel-build` scripts run it explicitly. The `vercel-build` script (`prisma generate && next build`) is what Vercel actually uses — it is checked before the framework default. Without it, Vercel can use a cached `node_modules` and skip `postinstall`, causing the deployed Prisma client to be out of sync with the schema. Locally, run `npm run db:generate` after every schema change — but stop the dev server first, since it holds the `.node` binary and the rename will fail with `EPERM` while it is running.

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

**All file uploads must bypass the serverless function.** Vercel functions have a 4.5MB payload limit — routing any file through `/api/upload` via FormData will 413 on larger images and almost any video. The correct pattern: canvas-compress images in the browser, then call `upload(filename, blob, { access: 'public', handleUploadUrl: '/api/upload' })` from `@vercel/blob/client`. The `/api/upload` route only runs `handleUpload` as a token handshake — no file bytes pass through it. Never reintroduce `put()` or FormData file uploads in that route.

**Do not store media as base64 in localStorage.** Raw `FileReader.readAsDataURL()` output for a few photos easily exceeds the ~5MB localStorage quota, throwing `QuotaExceededError`. Upload to Vercel Blob immediately on file select, store only the URL. `uploadIfBase64` in `POST /api/orders` already skips re-uploading if the value is already a URL.

**Use inline toasts, not `alert()`.** `MemorialEditor` has a `showToast(message, type)` helper (error = red, info = amber) with auto-dismiss and an × button. `EditForm` has a `saveError` state with a persistent red banner above the editor. Never add `alert()` calls — they block the UI thread and look out of place.
