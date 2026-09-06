-- ValPro initial schema — profiles + valuation history, with RLS so every
-- user can only ever read or write their own rows.
--
-- STATUS: not yet applied to any live project. This file is the prepared
-- migration for whenever a real Supabase project is connected (see
-- docs/VALPRO_AUTH_ARCHITECTURE.md, docs/VALPRO_PHASE_4_REPORT.md) — run it
-- via the Supabase SQL editor or `supabase db push` once
-- VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY exist. Never verified against a
-- real Postgres instance — see the Phase 4 report's Security section for
-- exactly what that means and doesn't mean.

-- ============================================================
-- profiles — one row per authenticated user, extends auth.users
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  display_name text,
  -- The whole ValPro Profile (src/types/profile.ts) as one JSON blob, not
  -- normalized into a column per field — that model already changes shape
  -- as onboarding evolves, and duplicating it into a rigid table schema
  -- here would mean a migration every time a screen adds a field. Null
  -- until the user's first profile sync (see migrateLocalProfileToCloud in
  -- src/services/profileRepository.ts).
  profile_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- 3-20 chars, lowercase letters/digits/underscore only. Enforced again in
  -- the app (src/auth/username.ts) before this constraint is ever hit, so a
  -- rejected signup reads as a friendly validation message, not a raw DB
  -- error — this is the last line of defense, not the first.
  constraint username_format check (username ~ '^[a-z0-9_]{3,20}$')
);

-- Case-insensitive uniqueness ("Alice" and "alice" are the same identity) —
-- a plain `unique` column constraint alone is case-sensitive and would let
-- both exist. The app also normalizes to lowercase before ever writing, so
-- this index is enforcement, not the primary defense.
create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));

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

-- Keeps updated_at honest without every call site remembering to set it.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-provisions a profiles row the moment a user signs up, reading the
-- username out of the metadata authService.signUp() already sends
-- (`options.data.username`) — this is what lets username live in `profiles`
-- without a separate, RLS-gated insert call racing the signup itself (which
-- can fail if email confirmation is required and the client isn't
-- authenticated yet at the moment signUp() returns).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, lower(new.raw_user_meta_data ->> 'username'));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- valuation_history — one row per saved ValPro result
-- ============================================================
create table if not exists public.valuation_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  domain_id text not null,
  -- Matches EvidenceStatus (src/types/domain.ts) as of Phase 3 — kept in
  -- sync with the app's type by hand since Postgres check constraints can't
  -- import a TypeScript union; if that type ever changes, this must too.
  market_evidence text not null check (market_evidence in ('supported', 'partial', 'insufficient')),
  market_value_lpa numeric,
  score integer,
  confidence text,
  -- Full ValuationResult (see src/types/valuation.ts) as JSON, so the
  -- explanation/gaps/scenarios shown at the time are preserved verbatim,
  -- not recomputed later against a possibly-changed engine/benchmark.
  raw_result jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.valuation_history enable row level security;

create policy "valuation history is readable by its owner"
  on public.valuation_history for select
  using (auth.uid() = user_id);

create policy "valuation history is insertable by its owner"
  on public.valuation_history for insert
  with check (auth.uid() = user_id);

-- Deliberately no update/delete policy — a saved valuation is an immutable
-- historical record, not an editable document. `updated_at` exists for
-- schema-shape consistency with `profiles`; nothing in the app writes it,
-- since there is no update path.

create index if not exists valuation_history_user_id_idx on public.valuation_history(user_id);
create index if not exists valuation_history_created_at_idx on public.valuation_history(created_at desc);
