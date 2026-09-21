-- ============================================================
-- IT Support Admin — Supabase DB Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Categories (tray app accordion groups)
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  icon        text not null default '📁',
  "order"     integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Quick Fix button list
create table if not exists quick_fixes (
  id             uuid primary key default gen_random_uuid(),
  category_id    uuid not null references categories(id) on delete cascade,
  label          text not null,
  command        text not null,
  requires_admin boolean not null default false,
  "order"        integer not null default 0
);

-- Windows settings shortcuts
create table if not exists settings_shortcuts (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references categories(id) on delete cascade,
  label        text not null,
  uri          text not null,
  "order"      integer not null default 0
);

-- PDF guide metadata
create table if not exists guides (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references categories(id) on delete cascade,
  filename     text not null,
  storage_url  text not null,
  uploaded_at  timestamptz not null default now()
);

-- ============================================================
-- RLS (Row Level Security) — authenticated users only
-- ============================================================
alter table categories        enable row level security;
alter table quick_fixes       enable row level security;
alter table settings_shortcuts enable row level security;
alter table guides            enable row level security;

-- Allow full access for authenticated users (admin portal)
create policy "authenticated users" on categories
  for all to authenticated using (true) with check (true);

create policy "authenticated users" on quick_fixes
  for all to authenticated using (true) with check (true);

create policy "authenticated users" on settings_shortcuts
  for all to authenticated using (true) with check (true);

create policy "authenticated users" on guides
  for all to authenticated using (true) with check (true);

-- Allow read-only access for anon role (tray app uses anon key)
create policy "anon read" on categories
  for select to anon using (true);

create policy "anon read" on quick_fixes
  for select to anon using (true);

create policy "anon read" on settings_shortcuts
  for select to anon using (true);

create policy "anon read" on guides
  for select to anon using (true);

-- ============================================================
-- Storage Bucket — PDF guide files
-- Create a "guides" bucket in Supabase Dashboard > Storage
-- (Set as Public bucket for direct URL access without signed URLs)
-- ============================================================

-- ============================================================
-- Sample data (optional)
-- ============================================================
insert into categories (title, icon, "order") values
  ('Network Issues', '🌐', 1),
  ('Printer Issues', '🖨️', 2),
  ('General Performance', '⚡', 3)
on conflict do nothing;
