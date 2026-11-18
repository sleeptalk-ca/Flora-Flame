# Flora & Flame — Premium Toronto Lifestyle

A premium, responsive storefront and admin dashboard for a North York cannabis-lifestyle brand, built with
**Next.js 16 (App Router, Cache Components)**, **TypeScript**, **Tailwind CSS v4**, **Supabase** and **Lucide** icons.

> **Compliance first.** Online checkout is disabled by design, cannabis and tobacco sales are blocked until the
> operator records the required authorizations, and Stripe is hard-blocked for restricted products. See
> [Compliance](#compliance) before enabling anything.

---

## Quick start

```bash
npm install
cp .env.example .env            # then fill in the values below
npm run dev                      # http://localhost:3000
```

Minimum `.env` for local development:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATA_BACKEND=local
ADMIN_SESSION_SECRET=<48+ random chars>   # node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=your-strong-password
```

`ADMIN_PASSWORD` is read only on the server and never sent to the browser. For extra safety you can store a
hash instead: `npm run hash-password -- "your password"` and set `ADMIN_PASSWORD_HASH` (the hash wins if both
are set).

With `DATA_BACKEND=local` the site runs on a JSON file (`data/store.json`) seeded with demo content — no database
needed. Admin: **/admin** (sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`).

| Script | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Develop, build, serve |
| `npm run lint` / `typecheck` | ESLint / TypeScript |
| `npm run hash-password -- "pw"` | Optional: generate `ADMIN_PASSWORD_HASH` (scrypt) instead of a plain password |
| `npm run db:migrate` | Create/update the Supabase schema (needs `DATABASE_STRING`) |
| `npm run db:seed [-- --demo-data]` | Seed Supabase with the demo catalogue (optionally demo orders) |
| `npm run data:reset` | Reset the local JSON store to seed data |

---

## Supabase (production)

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor — creates tables, RLS policies and the
   public `product-images` storage bucket.
3. Add to your environment (server-side only — **never** prefix with `NEXT_PUBLIC_`):
   ```env
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=...
   DATA_BACKEND=supabase
   ```
4. `npm run db:seed` to load the demo catalogue (or start empty and add products in the admin).

**Security model:** RLS is enabled on every table. The anonymous role can only read active products, categories
and site settings. Orders and inquiries have no client policies at all. Every write goes through the Next.js
server with the service-role key, after the admin session is verified. No Supabase keys are sent to the browser.

**Admin via Supabase Auth (optional):** set `ADMIN_AUTH_MODE=supabase`, `SUPABASE_ANON_KEY`, and
`ADMIN_EMAILS=owner@example.com,manager@example.com`. Create those users in Supabase Auth; only allow-listed emails
can sign in.

> The local JSON store is for development and demos only — serverless hosts have read-only file systems.

---

## Features

**Storefront**
- Home: editorial hero, brand introduction, featured collection, categories, best sellers, brand story, Toronto
  photography mosaic, contact block
- Shop with category tabs, search and sorting (URL-driven, shareable)
- Product pages: gallery, CAD pricing, product information, related products, "Ask about this product"
- About, Contact (validated form with honeypot + rate limiting), ordering-status page
- Legal: Terms, Privacy (PIPEDA), Shipping & pickup, Refunds, Compliance
- Age gate (19+), SEO metadata, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt`, scroll-reveal animations,
  reduced-motion support, mobile navigation

**Admin (`/admin`)**
- Overview: stock alerts, new inquiries, revenue, compliance status
- Products: create / edit / delete, image upload or URL, gallery, publish / feature toggles, demo & illustrative flags
- Categories: CRUD with a regulatory class (cannabis / tobacco / none) that drives sales gating
- Inventory & prices: inline editing of price (CAD), stock and availability
- Orders: record manual orders (blocked for restricted classes without authorization; ID-check confirmation
  required), status updates, clear demo orders
- Inquiries: inbox with status workflow, reply by email, delete
- Analytics: revenue by month / category, top products, orders by status, inventory value
- Homepage: hero copy & image, announcement bar, ordered featured products
- Settings: contact information, compliance & payment controls

---

## Architecture

```
app/
  (site)/            public storefront (layout with header, footer, age gate)
  admin/
    login/           sign-in (rate-limited)
    (dashboard)/     protected admin pages
    actions.ts       all admin server actions (each re-verifies the session)
  api/admin/upload/  image upload (auth + same-origin + magic-byte validation, 5 MB max)
  media/[file]/      serves locally uploaded images (local mode)
components/ ui/ site/ admin/
lib/
  data/              DataStore interface, local + Supabase implementations, cached queries, seed
  auth/              JWT session (jose), credential check (scrypt / Supabase Auth), guards
  payments/          modular payment layer — no provider active
  validation.ts      zod schemas shared by client and server
proxy.ts             first-line protection for /admin and /api/admin
supabase/schema.sql  database schema + RLS + storage bucket
```

- **Caching:** public reads use `'use cache'` with `cacheTag`. Admin mutations call `updateTag`, so storefront
  changes appear immediately.
- **Auth:** HS256-signed JWT in an `httpOnly`, `SameSite=Strict`, `Secure` (in production) cookie with an 8-hour
  expiry. It is checked in `proxy.ts` **and** again in every admin page, server action and route handler.
- **Security headers:** `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` and HSTS are set in
  `next.config.ts`. Admin routes add `noindex` and `no-store`.
- **Rate limiting** is in-memory per server instance. For multi-instance or serverless deployments, back
  `lib/rate-limit.ts` with a shared store (e.g. Upstash Redis).

---

## Images

Sample photography comes from **Pexels** (free under the [Pexels licence](https://www.pexels.com/license/)). Every
URL was checked as reachable when the site was built. Product images are flagged **"Illustrative image"**.
Replace images in **Admin → Products**
(upload or URL) and **Admin → Homepage** (hero). Sample product copy contains no THC/CBD figures, effect claims or
certifications.

---

## Compliance

This codebase gives you the controls; it is **not legal advice**. Before selling anything, confirm with
qualified Ontario counsel:

- **Cannabis retail** requires AGCO licensing (Retail Operator Licence, Retail Store Authorization, and Cannabis
  Retail Manager licences as applicable). Cannabis orders stay blocked until these are recorded in Settings.
- **Tobacco (grabba)** sales are restricted to adults 19+ under the Smoke-Free Ontario Act, 2017; local vendor
  licensing may also apply. Nicotine warnings are shown on grabba listings.
- **Promotion rules:** the federal *Cannabis Act* and the *Tobacco and Vaping Products Act* restrict promotion,
  including lifestyle advertising and content appealing to young people. The marketing pages pair city and interior
  photography with brand copy. **Have counsel review the homepage and About page imagery and copy**, and consider
  restricting access or separating lifestyle content from product listings if advised.
- **Age gate:** a 19+ date-of-birth confirmation. The date of birth is never stored or sent. It is **not**
  identity verification — every sale must check government-issued photo ID.
- **Payments:** no provider is registered (`lib/payments/index.ts`). Stripe is hard-blocked for cannabis and
  tobacco: its restricted-business policy prohibits marijuana businesses and restricts tobacco. Only add an
  adapter for a provider that has **approved this business in writing** for the product classes sold, then record
  the approval reference in Settings. Checkout opens only when every gate passes.
- **Privacy:** contact-form data is used only to reply. Review the Privacy page for PIPEDA compliance with your
  actual hosting providers and retention practices.

---

## Deploying to Vercel

1. **Import** the GitHub repo in Vercel (Framework preset: Next.js — no build settings to change).
2. **Prepare Supabase first** (once): `npm run db:migrate` (needs `DATABASE_STRING` — use the *Session pooler* URI)
   and `npm run db:seed`, or paste `supabase/schema.sql` into the Supabase SQL Editor.
3. **Environment variables** (Vercel → Project → Settings → Environment Variables):

   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-domain.ca` |
   | `DATA_BACKEND` | `supabase` |
   | `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase **secret** key (`sb_secret_…`) |
   | `SUPABASE_STORAGE_BUCKET` | `product-images` |
   | `ADMIN_SESSION_SECRET` | new random 48+ char string (don't reuse your local one) |
   | `ADMIN_EMAIL` | admin login email |
   | `ADMIN_PASSWORD` *or* `ADMIN_PASSWORD_HASH` | admin password (hash recommended) |

   `DATABASE_STRING` is **not** needed on Vercel — it's only for running migrations from your computer.
4. **Redeploy** after changing environment variables (`SUPABASE_URL` is read at build time to allow
   Supabase-hosted images through Next's image optimizer).

### Images on Vercel

Vercel's file system is read-only and temporary, so uploads are never stored on the server:

- Admin uploads go to the **Supabase Storage** bucket `product-images` (public read, images only, 5 MB cap)
  and are served from Supabase's CDN, then optimized by `next/image`.
- Before uploading, the admin's browser **resizes** images (longest side 2400px) and re-encodes them as WebP,
  so 5–12 MB phone photos become a few hundred KB. This keeps uploads under Vercel's 4.5 MB request limit and
  strips EXIF metadata such as GPS location. The server re-checks the file signature and caps uploads at 4 MB.
- The local file store (`DATA_BACKEND=local`) refuses to run on Vercel with a clear error, so data can't be
  silently lost.
- Replacing or deleting a product does not delete its old image from Storage; clean up unused files in the
  Supabase dashboard (Storage → product-images) from time to time.
