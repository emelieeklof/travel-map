-- SPOTTED — Supabase schema + Row Level Security
-- Run this once in your project's SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  handle text not null,
  name text not null,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  description text,
  center_lat double precision,
  center_lng double precision,
  zoom int,
  created_at timestamptz not null default now()
);

create table if not exists places (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references collections (id) on delete cascade,
  name text not null,
  category text not null,
  lat double precision not null,
  lng double precision not null,
  address text,
  notes text,
  photo_url text,
  instagram_url text,
  place_id text,
  phone_number text,
  price_level int,
  opening_hours text[],
  google_maps_uri text,
  business_status text,
  created_at timestamptz not null default now()
);

-- Migrations: safe to run alone if `places` already existed before these columns were added.
alter table places add column if not exists instagram_url text;
alter table places add column if not exists phone_number text;
alter table places add column if not exists price_level int;
alter table places add column if not exists opening_hours text[];
alter table places add column if not exists google_maps_uri text;
alter table places add column if not exists business_status text;

create table if not exists followed_creators (
  user_id uuid not null references profiles (id) on delete cascade,
  creator_id text not null,
  primary key (user_id, creator_id)
);

alter table profiles enable row level security;
alter table collections enable row level security;
alter table places enable row level security;
alter table followed_creators enable row level security;

-- profiles: you can read/write only your own row
drop policy if exists "profiles: select own" on profiles;
create policy "profiles: select own" on profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles: insert own" on profiles;
create policy "profiles: insert own" on profiles
  for insert with check (auth.uid() = id);
drop policy if exists "profiles: update own" on profiles;
create policy "profiles: update own" on profiles
  for update using (auth.uid() = id);

-- collections: you can read/write only rows you own
drop policy if exists "collections: select own" on collections;
create policy "collections: select own" on collections
  for select using (auth.uid() = owner_id);
drop policy if exists "collections: insert own" on collections;
create policy "collections: insert own" on collections
  for insert with check (auth.uid() = owner_id);
drop policy if exists "collections: update own" on collections;
create policy "collections: update own" on collections
  for update using (auth.uid() = owner_id);
drop policy if exists "collections: delete own" on collections;
create policy "collections: delete own" on collections
  for delete using (auth.uid() = owner_id);

-- places: you can read/write only places inside a collection you own
drop policy if exists "places: select own" on places;
create policy "places: select own" on places
  for select using (
    exists (select 1 from collections c where c.id = places.collection_id and c.owner_id = auth.uid())
  );
drop policy if exists "places: insert own" on places;
create policy "places: insert own" on places
  for insert with check (
    exists (select 1 from collections c where c.id = places.collection_id and c.owner_id = auth.uid())
  );
drop policy if exists "places: update own" on places;
create policy "places: update own" on places
  for update using (
    exists (select 1 from collections c where c.id = places.collection_id and c.owner_id = auth.uid())
  );
drop policy if exists "places: delete own" on places;
create policy "places: delete own" on places
  for delete using (
    exists (select 1 from collections c where c.id = places.collection_id and c.owner_id = auth.uid())
  );

-- followed_creators: you can read/write only your own follow rows
drop policy if exists "follows: select own" on followed_creators;
create policy "follows: select own" on followed_creators
  for select using (auth.uid() = user_id);
drop policy if exists "follows: insert own" on followed_creators;
create policy "follows: insert own" on followed_creators
  for insert with check (auth.uid() = user_id);
drop policy if exists "follows: delete own" on followed_creators;
create policy "follows: delete own" on followed_creators
  for delete using (auth.uid() = user_id);
