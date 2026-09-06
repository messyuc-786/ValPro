-- ValPro initial schema — profiles + valuation history, with RLS so every
-- user can only ever read or write their own rows.
--
-- STATUS: not yet applied to any live project. This file is the prepared
-- migration for whenever a real Supabase project is connected (see
-- docs/VALPRO_AUTH_ARCHITECTURE.md) — run it via the Supabase SQL editor or
-- `supabase db push` once VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY exist.

-- ============================================================
-- profiles — one row per authenticated user, extends auth.users
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by their owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles are insertable by their owner"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles are updatable by their owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No delete policy: a user cannot delete their own profile row through the
-- client. Account deletion, if ever needed, should go through a server-side
-- admin action (a Supabase Edge Function using the service-role key), never
-- the anon-key client — the anon key must never be able to delete auth data.

-- ============================================================
-- valuation_history — one row per saved ValPro result
-- ============================================================
create table if not exists public.valuation_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  domain_id text not null,
  market_evidence text not null check (market_evidence in ('demo', 'insufficient')),
  market_value_lpa numeric,
  score integer,
  confidence text,
  -- Full ValuationResult (see src/types/valuation.ts) as JSON, so the
  -- explanation/gaps/scenarios shown at the time are preserved verbatim,
  -- not recomputed later against a possibly-changed engine/benchmark.
  raw_result jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.valuation_history enable row level security;

create policy "valuation history is readable by its owner"
  on public.valuation_history for select
  using (auth.uid() = user_id);

create policy "valuation history is insertable by its owner"
  on public.valuation_history for insert
  with check (auth.uid() = user_id);

-- Deliberately no update/delete policy — a saved valuation is an immutable
-- historical record, not an editable document.

create index if not exists valuation_history_user_id_idx on public.valuation_history(user_id);
create index if not exists valuation_history_created_at_idx on public.valuation_history(created_at desc);
