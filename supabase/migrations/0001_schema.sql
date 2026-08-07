-- ============================================================================
-- Ibibondo — initial schema
--
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query),
-- top to bottom, once. Run 0002_seed.sql straight after — it depends on
-- these tables existing.
--
-- Table shapes mirror src/lib/services/types.ts field-for-field. Ids are
-- plain text (not uuid) matching the ids already used by the mock data
-- (e.g. 'c1', 'p-preemie-slow-flow-bottle') so the seed script can reuse
-- them verbatim and every cross-reference (kit → products, order line →
-- product) is a simple string match, no join-table indirection needed.
-- New rows default to a fresh uuid if the app doesn't supply one.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- categories
create table public.categories (
  id          text primary key default gen_random_uuid()::text,
  slug        text not null unique,
  name        text not null,
  tagline     text not null,
  color_key   text not null,
  icon        text not null,
  sort_order  int  not null default 0,
  -- Array of {slug, name} — always read/written as a whole with the
  -- category, never queried independently, so JSONB is the natural fit.
  subcategories jsonb not null default '[]'
);

-- --------------------------------------------------------------------- stages
create table public.stages (
  id           text primary key default gen_random_uuid()::text,
  slug         text not null unique,
  label        text not null,
  short_label  text not null,
  description  text not null,
  sort_order   int  not null default 0
);

-- ------------------------------------------------------------------- products
create table public.products (
  id                text primary key default gen_random_uuid()::text,
  slug              text not null unique,
  name              text not null,
  subtitle          text not null,
  description       text not null,
  category_slug     text not null references public.categories (slug),
  -- Loose reference into that category's `subcategories` JSONB array — not
  -- a real FK, same treatment the mock service already gives it.
  subcategory_slug  text,
  brand             text not null default 'Ibibondo',
  price_rwf         int  not null check (price_rwf >= 0),
  compare_at_rwf    int  check (compare_at_rwf is null or compare_at_rwf >= 0),
  images            text[] not null default '{}',
  art               text not null default 'bottle',
  stage_slugs       text[] not null default '{}',
  tags              text[] not null default '{}',
  rating            numeric not null default 4.5,
  review_count      int  not null default 0,
  stock             int  not null default 0 check (stock >= 0),
  is_featured       boolean not null default false,
  is_bestseller     boolean not null default false,
  care_notes        text[] not null default '{}',
  -- Array of {id, label, priceDelta, stock, sku}
  variants          jsonb not null default '[]',
  -- Array of {id, label, hex, stock}
  color_options     jsonb not null default '[]',
  length_cm         numeric not null default 15,
  width_cm          numeric not null default 12,
  height_cm         numeric not null default 10,
  weight_kg         numeric not null default 0.3,
  created_at        timestamptz not null default now()
);

create index products_category_slug_idx on public.products (category_slug);

-- ----------------------------------------------------------------------- kits
create table public.kits (
  id           text primary key default gen_random_uuid()::text,
  slug         text not null unique,
  name         text not null,
  description  text not null,
  -- Loose references to products.id — see note above on why this isn't a
  -- join table.
  product_ids  text[] not null default '{}',
  price_rwf    int  not null check (price_rwf >= 0),
  color_key    text not null,
  icon         text not null
);

-- ------------------------------------------------------------------- articles
create table public.articles (
  id             text primary key default gen_random_uuid()::text,
  slug           text not null unique,
  title          text not null,
  excerpt        text not null,
  -- Paragraphs joined by a blank line, same convention as policies.body.
  body           text not null,
  topic          text not null,
  read_minutes   int  not null default 3,
  author         text not null default 'Ibibondo',
  published_at   date not null default current_date,
  color_key      text not null
);

-- ------------------------------------------------------------------- policies
create table public.policies (
  key      text primary key,
  title    text not null,
  updated  text not null,
  body     text not null
);

-- -------------------------------------------------------------- delivery_zones
create table public.delivery_zones (
  id         text primary key default gen_random_uuid()::text,
  name       text not null,
  fee_rwf    int  not null check (fee_rwf >= 0),
  eta_hours  text not null
);

-- --------------------------------------------------------------- store_settings
-- Singleton table — the `check (id = 1)` keeps it to exactly one row.
create table public.store_settings (
  id                          int primary key default 1 check (id = 1),
  store_name                  text not null default 'Ibibondo',
  tagline                     text not null default '',
  contact_email               text not null default '',
  contact_phone               text not null default '',
  whatsapp_number             text not null default '',
  free_delivery_threshold_rwf int  not null default 50000,
  facebook_url                text not null default '',
  instagram_url               text not null default '',
  tiktok_url                  text not null default '',
  twitter_url                 text not null default ''
);

-- ---------------------------------------------------------------------- orders
create table public.orders (
  id                 text primary key default gen_random_uuid()::text,
  reference          text not null unique,
  status             text not null default 'pending'
                       check (status in ('pending','paid','processing','shipped','delivered','cancelled')),
  -- Array of {productId, variantId, quantity} — kept as JSONB rather than a
  -- normalised order_lines table because the admin Analytics page already
  -- aggregates lines client-side (fetch all orders, reduce in JS); a
  -- separate table would only pay off once that reporting moves into SQL.
  lines              jsonb not null default '[]',
  subtotal_rwf       int  not null check (subtotal_rwf >= 0),
  delivery_rwf       int  not null check (delivery_rwf >= 0),
  total_rwf          int  not null check (total_rwf >= 0),
  customer_name      text not null,
  customer_phone     text not null,
  address            text not null,
  delivery_zone_id   text not null references public.delivery_zones (id),
  delivery_zone_name text not null,
  payment_method     text not null check (payment_method in ('momo','visa','mastercard')),
  -- Null for guest checkout. Set to the signed-in shopper's id so "my
  -- orders" can be a straightforward `select ... where user_id = auth.uid()`
  -- once that page exists.
  user_id            uuid references auth.users (id) on delete set null,
  created_at         timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_created_at_idx on public.orders (created_at desc);

-- ============================================================================
-- Auth: staff (admin dashboard access) and profiles (optional shopper accounts)
-- ============================================================================

-- Anyone listed here can sign into /admin. Rows are added by hand in the SQL
-- Editor — there's deliberately no self-service "become an admin" UI.
create table public.staff (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  role        text not null default 'admin',
  created_at  timestamptz not null default now()
);

-- One row per shopper who creates an account. Guest checkout never touches
-- this table at all.
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  phone       text,
  created_at  timestamptz not null default now()
);

-- Auto-create a blank profile the moment someone signs up, so the app never
-- has to handle "authenticated but no profile row yet".
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- `security definer` so it can read the staff table for the *current* user
-- without RLS on `staff` (below) causing infinite recursion when a policy
-- calls this function.
create function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

-- ============================================================================
-- Row Level Security
--
-- Pattern: catalogue/content tables are world-readable (the storefront runs
-- with no session at all) and staff-only to write. Orders are the one
-- exception — anyone can create one (guest checkout), but only staff can
-- list or update them; a signed-in shopper can additionally read their own.
-- ============================================================================

alter table public.categories       enable row level security;
alter table public.stages           enable row level security;
alter table public.products         enable row level security;
alter table public.kits             enable row level security;
alter table public.articles         enable row level security;
alter table public.policies         enable row level security;
alter table public.delivery_zones   enable row level security;
alter table public.store_settings   enable row level security;
alter table public.orders           enable row level security;
alter table public.staff            enable row level security;
alter table public.profiles         enable row level security;

-- Catalogue/content: public read, staff write.
create policy "categories are publicly readable" on public.categories for select using (true);
create policy "staff manage categories" on public.categories for all using (public.is_staff()) with check (public.is_staff());

create policy "stages are publicly readable" on public.stages for select using (true);
create policy "staff manage stages" on public.stages for all using (public.is_staff()) with check (public.is_staff());

create policy "products are publicly readable" on public.products for select using (true);
create policy "staff manage products" on public.products for all using (public.is_staff()) with check (public.is_staff());

create policy "kits are publicly readable" on public.kits for select using (true);
create policy "staff manage kits" on public.kits for all using (public.is_staff()) with check (public.is_staff());

create policy "articles are publicly readable" on public.articles for select using (true);
create policy "staff manage articles" on public.articles for all using (public.is_staff()) with check (public.is_staff());

create policy "policies are publicly readable" on public.policies for select using (true);
create policy "staff manage policies" on public.policies for all using (public.is_staff()) with check (public.is_staff());

create policy "delivery zones are publicly readable" on public.delivery_zones for select using (true);
create policy "staff manage delivery zones" on public.delivery_zones for all using (public.is_staff()) with check (public.is_staff());

create policy "store settings are publicly readable" on public.store_settings for select using (true);
create policy "staff manage store settings" on public.store_settings for all using (public.is_staff()) with check (public.is_staff());

-- Orders: guest checkout can insert; only staff (or the owning shopper) can
-- read; only staff can change status. No delete policy at all — orders are
-- never deletable, matching the mock service.
--
-- The check on user_id stops a caller from stamping someone else's account
-- onto an order (either leave it null for a guest, or it must be your own
-- id). Line totals aren't independently re-validated server-side yet — the
-- same trust boundary the mock checkout already has — so revisit this
-- policy when real payment processing lands and totals need to come from a
-- trusted source instead of the client.
create policy "anyone can place an order" on public.orders for insert
  with check (user_id is null or user_id = auth.uid());
create policy "staff or the owner can view an order" on public.orders for select using (public.is_staff() or auth.uid() = user_id);
create policy "staff update order status" on public.orders for update using (public.is_staff()) with check (public.is_staff());

-- Staff table: staff can see who else is staff. No write policy — adding or
-- removing staff is a SQL Editor operation, not an app feature (yet).
create policy "staff can list staff" on public.staff for select using (public.is_staff());

-- Profiles: a shopper can read/update their own row; staff can read all.
-- No insert policy — profile rows are only ever created by the
-- `handle_new_user` trigger, which runs as `security definer` and so
-- bypasses RLS entirely.
create policy "read own profile or staff read all" on public.profiles for select using (auth.uid() = id or public.is_staff());
create policy "update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
