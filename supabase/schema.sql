-- ─────────────────────────────────────────────────────────────
-- Flora & Flame — Supabase schema
-- Run in the Supabase SQL editor (or `supabase db push`).
--
-- Security model:
--   * RLS is ENABLED on every table.
--   * The anon role can only READ the public catalogue (active products, categories, site settings).
--   * Orders and inquiries have NO anon/authenticated policies → unreadable from the browser.
--   * All writes go through the Next.js server using the service-role key (never exposed to the client),
--     after the admin session is verified.
-- ─────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- Categories ───────────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null check (char_length(name) between 2 and 80),
  description text not null default '',
  image_url   text not null default '',
  restricted  text not null default 'none' check (restricted in ('cannabis', 'tobacco', 'none')),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Products ─────────────────────────────────────────────────────
create table if not exists public.products (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name                  text not null check (char_length(name) between 2 and 120),
  short_description     text not null default '',
  description           text not null default '',
  price_cents           integer not null check (price_cents >= 0),
  category_id           uuid not null references public.categories(id) on delete restrict,
  image_url             text not null default '',
  gallery               text[] not null default '{}',
  availability          text not null default 'in_stock'
                          check (availability in ('in_stock', 'low_stock', 'out_of_stock', 'coming_soon')),
  inventory             integer not null default 0 check (inventory >= 0),
  sku                   text not null default '',
  details               text not null default '',
  is_featured           boolean not null default false,
  is_best_seller        boolean not null default false,
  is_active             boolean not null default true,
  is_demo               boolean not null default false,
  image_is_illustrative boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_idx on public.products(is_active);

-- Orders (manual / authorized only — online checkout is disabled) ──
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text not null unique,
  customer_name   text not null,
  customer_email  text not null,
  customer_phone  text not null default '',
  status          text not null default 'pending'
                    check (status in ('pending', 'confirmed', 'ready', 'fulfilled', 'cancelled', 'refunded')),
  fulfillment     text not null default 'pickup' check (fulfillment in ('pickup', 'delivery')),
  items           jsonb not null default '[]'::jsonb,
  subtotal_cents  integer not null check (subtotal_cents >= 0),
  tax_cents       integer not null check (tax_cents >= 0),
  total_cents     integer not null check (total_cents >= 0),
  notes           text not null default '',
  is_demo         boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists orders_created_idx on public.orders(created_at desc);

-- Customer inquiries (contact form) ────────────────────────────
create table if not exists public.inquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text not null default '',
  subject     text not null,
  message     text not null check (char_length(message) <= 4000),
  product_id  uuid references public.products(id) on delete set null,
  status      text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  created_at  timestamptz not null default now()
);
create index if not exists inquiries_created_idx on public.inquiries(created_at desc);

-- Site settings (single row, JSON document) ────────────────────
create table if not exists public.site_settings (
  id          integer primary key default 1 check (id = 1),
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- Row Level Security ───────────────────────────────────────────
alter table public.categories    enable row level security;
alter table public.products      enable row level security;
alter table public.orders        enable row level security;
alter table public.inquiries     enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories" on public.categories
  for select to anon, authenticated using (true);

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products" on public.products
  for select to anon, authenticated using (is_active = true);

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings" on public.site_settings
  for select to anon, authenticated using (true);

-- No policies on orders / inquiries: only the service role (server) can access them.

-- Storage bucket for product images (public read; uploads only via server/service role) ──
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
