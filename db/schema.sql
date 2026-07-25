create extension if not exists pgcrypto;

-- Mirrors Clerk users lazily: a row is created on first authenticated request
-- (see netlify/functions/me.ts), keyed by the Clerk user id (sub claim).
create table if not exists users (
  id text primary key,
  phone text,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists progress_entries (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  before_image_url text not null,
  after_image_url text not null,
  summary text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  message text not null,
  created_at timestamptz not null default now()
);
