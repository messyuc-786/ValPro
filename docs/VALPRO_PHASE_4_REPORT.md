# ValPro Phase 4 Report — Accounts + User Identity + Supabase Foundation

## Objective

Add a production-quality account foundation (auth, username, profile sync,
saved valuations) using Supabase — architecture and wiring, since **no live
Supabase project exists**. Preserve the local-first experience; never lose a
user's data; never expose secrets or raw errors; never fake a database
verification that didn't happen.

## Audit findings (Step 1)

Read before any change:

- **Profile model / AppContext** (`src/state/AppContext.tsx`) — a
  `useReducer` over `Profile`, persisted to `localStorage` via a
  `useEffect`, no auth state at all prior to this phase. `screen`/`history`
  are separate, in-memory-only state (never persisted — deliberate, from an
  earlier phase, so a refresh always opens at Welcome).
- **`src/state/persistence.ts`** — one key, `valpro.profile.v2`, defensive
  shallow-merge on load (tolerates schema drift without crashing), legacy
  key cleanup already in place. Nothing here needed to change — it remains
  the local source of truth.
- **Domain/valuation architecture** — untouched by this phase, confirmed
  still 72/72 passing before any Phase 4 code was written.
- **Existing auth scaffolding** (from an earlier phase, never wired in):
  `src/lib/supabaseClient.ts` (lazy client, `isSupabaseConfigured` gate),
  `src/auth/authService.ts` (signUp/signIn/signOut/etc., all
  not-configured-safe), `supabase/migrations/0001_init.sql`
  (profiles + valuation_history + RLS), `.env.example`, and three built,
  unwired auth screens (`SignIn`/`SignUp`/`ForgotPassword`/`AuthShell`).
  None of this was reachable from the app — confirmed by the production
  bundle size being unchanged when it was added.
- **A real bug found in that existing schema during audit:** the
  `valuation_history.market_evidence` check constraint still listed
  `'demo'`/`'insufficient'` — the values from *before* Phase 3 renamed the
  evidence states to `'supported'/'partial'/'insufficient'`. Fixed as part
  of this phase's schema work.
- **Environment/deployment config** — Vite env vars (`VITE_` prefix,
  already the pattern `.env.example` used), GitHub Pages static deploy
  (`gh-pages`, no server-side secrets possible or needed — the anon key is
  meant to be public, constrained entirely by RLS).
- **Test architecture** — Vitest + RTL, jsdom environment, no existing
  pattern for mocking Supabase — established one this phase (see Testing).

## Supabase foundation (Step 2)

Unchanged from the prior phase's audit, re-verified: `VITE_SUPABASE_URL` /
`VITE_SUPABASE_ANON_KEY` read via `import.meta.env`, `isSupabaseConfigured`
gates every code path, `getSupabaseClient()` never throws. **Confirmed
again this phase:** `npm run build` succeeds with no env vars set (the
actual current state) — the app is not broken by their absence.

No service-role key exists anywhere in this codebase, committed or
otherwise — service-role operations (e.g. account deletion) are explicitly
documented in the migration as something that must go through a
server-side function, never the client.

## Authentication (Step 3)

`src/auth/authService.ts` — sign up, log in, log out, session restoration,
all present before this phase; this phase added:

- **Human-readable error mapping** (`toHumanMessage()`) — a real gap found
  on audit: `signIn`/`signUp` previously returned `error.message` from
  Supabase **directly** to the caller, which is a developer-facing string
  ("Invalid login credentials", raw Postgres text), not something to show a
  user. Now mapped: invalid credentials, duplicate account, invalid email,
  weak password, rate limiting, network failure, expired session, and a
  generic fallback for anything unrecognized — nothing raw ever reaches the
  UI.
- Session restoration wired into `AppContext` (`getCurrentSession()` on
  mount + `onAuthStateChange()` subscription) — a page refresh restores the
  session; sign-in/out from any tab updates this tab's state too.

**Architecture for additional auth methods later:** `authService.ts` is the
only seam the app talks to. Adding OAuth (Google, etc.) means adding a
function here and a button in the UI — no other file changes, since no
screen imports the Supabase client directly.

## Username (Step 4)

`src/auth/username.ts` (new) — pure, unit-tested rules:

- 3-20 characters, lowercase letters/digits/underscore only.
- `normalizeUsername()` lowercases + trims — "Alice" and "alice" are the
  same identity, checked client-side *and* enforced server-side (see
  Schema).
- `checkUsernameAvailable()` in `authService.ts` — a live "is this taken?"
  check against `profiles`, run automatically before `signUp()` submits.
- Username is stored in `profiles.username` (see Schema), retrievable with
  the rest of the profile row — never the email.
- **Public profile URLs (`valpro.app/u/username`) are explicitly NOT
  implemented** — the username system is ready for it (unique, normalized,
  stored), but no route/screen for it exists, per the brief's own "not
  unless trivial" guidance. It is not trivial with the current
  state-machine navigation (no URL routing exists in this app at all), so
  it was left out.

## Database schema (Step 5)

`supabase/migrations/0001_init.sql`, extended this phase:

**`profiles`** — `id` (references `auth.users`), `username`,
`display_name`, `profile_data` (the whole ValPro `Profile` as one JSON
blob — deliberately not normalized into a column per field, since that
model changes shape as onboarding evolves and a rigid schema would need a
migration every time), `created_at`, `updated_at` (auto-maintained by a
trigger). A case-insensitive unique index on `lower(username)` and a
`username_format` check constraint back up the client-side validation.

**`on_auth_user_created` trigger** (new) — auto-inserts the `profiles` row
the moment someone signs up, reading `username` out of the auth metadata
`authService.signUp()` already sends. This avoids a race where a
client-side insert could run before the session the RLS insert policy
requires actually exists (relevant when email confirmation is required).

**`valuation_history`** — `user_id`, `domain_id`, `market_evidence` (fixed
to match Phase 3's actual evidence-state values), `market_value_lpa`,
`score`, `confidence`, `raw_result` (full `ValuationResult` JSON — the
explanation/gaps/scenarios shown at the time, preserved verbatim, not
recomputed later against a possibly-changed engine), `created_at`,
`updated_at` (present for schema-shape consistency; nothing writes it,
since a saved valuation is immutable).

## Row Level Security (Step 6)

Every policy scopes access to `auth.uid()`. No `using (true)` anywhere. No
delete policy on either table (the anon-key client can never delete a row).
**This was reviewed statically, not verified against a live database** —
see `src/security/rlsPolicies.test.ts`, which parses the migration SQL and
asserts RLS is enabled on every table and every policy references
`auth.uid()`. That test catches an accidental regression (a policy or
`enable row level security` line being deleted later); **it is not proof
that "User A cannot read User B's profile" actually holds** — that
requires two real accounts against a real Postgres instance, which does
not exist. This is stated plainly rather than implied.

## Local-first transition (Step 7)

`localStorage` remains exactly as it was — the local profile is still the
source of truth for the app's own working state; nothing about this phase
changes what onboarding reads or writes locally.

`src/services/profileRepository.ts` (new) is the sync boundary:
`loadCloudProfile`, `saveCloudProfile`, `loadSavedValuations`,
`saveValuation`, and `migrateLocalProfileToCloud`. The migration function:

- Runs once per sign-in (tracked per user id in `AppContext`, not a global
  flag — a different user signing in during the same page load re-checks).
- Skips a genuinely empty local profile (nothing to migrate).
- **Never overwrites a cloud profile that already has data** — the cloud
  copy wins once one exists, rather than attempting a merge that could
  silently drop a field either side entered. Deterministic: given the same
  (user, local profile, cloud state), the outcome is always the same — unit
  tested (`profileRepository.test.ts`) with a mocked client for all three
  branches (migrated / skipped-empty / skipped-has-cloud-data).
- Failure is silent to the user by design (`.catch(() => {})` in
  `AppContext`) — sync is additive on top of the working local copy, so a
  sync failure must never break or interrupt the product.

## Auth UI (Step 8)

`SignIn` / `SignUp` / `ForgotPassword` (pre-existing, from an earlier
phase) now actually reachable, via `AuthShell` — same `Backdrop`,
`Wordmark`, back-button convention, `FooterMark`, typography scale as every
other screen. **A real bug found via visual verification, not just code
review:** `AuthShell` was pointing its backdrop at `welcome.jpg`, which has
mockup text baked into the image that needs the heavier `hero` scrim
treatment (see `Backdrop.tsx`) to hide — paired with `AuthShell`'s lighter
`standard` scrim (correct for a plain decorative photo, wrong for that
one), the baked text visibly bled through behind the form. Fixed by
pointing the auth screens at `creators.jpg` (the same clean, non-text photo
About/How It Works/FAQ already use) instead of introducing a new asset or
changing the scrim system.

Auth screens use the same phone-frame shell every onboarding screen does —
confirmed no horizontal overflow at 375, 768, and 1440px live in the
production build (bracketing the full 375-1440 range); 390/430/820/1024/
1280 were not each individually re-screenshotted this phase but share the
identical shell already verified overflow-free at every one of these
widths in the Phase 0-3 reports.

## Account entry point (Step 9)

Added to Welcome's nav (both mobile and desktop blocks) as a plain text
link — "Sign In" when signed out, `username` + "Sign Out" when signed in —
visually identical weight to About/How It Works/FAQ, not a button
competing with the primary CTA. Rendered even though no project is
configured today: tapping it honestly explains accounts aren't available
yet (via `AuthShell`'s existing notice) rather than hiding the entry point,
which would look like an even less finished feature.

A layout issue was caught and fixed during responsive verification: adding
a fourth nav item caused word-wrapping ("Sign In" breaking into "Sign" /
"In" mid-word) at 375px. Fixed with `flex-wrap` + `whitespace-nowrap` so
items wrap as whole pills onto a second line if ever needed, never
mid-word — verified no horizontal overflow after the fix.

## Profile synchronization (Step 10)

Covered under Steps 5/7 — `profileRepository.ts` is the only file that
imports the Supabase client for data access; no screen does. `AppContext`
calls the repository, never the client directly.

## Security (Step 11)

- No secrets committed — `.env`/`.env.*` git-ignored (except
  `.env.example`, the placeholder template); confirmed via `git status`
  showing no such files tracked.
- No service-role key anywhere in the repository.
- Every database query in `profileRepository.ts` and `authService.ts` is
  scoped by a `userId` that comes from the authenticated session
  (`session.user.id`) in `AppContext` — nothing in the UI passes a
  user-suppliable id into a query. RLS is the actual enforcement backstop
  server-side (see Step 6's honesty caveat about it being unverified live).
- `checkUsernameAvailable` and the signup flow can race under concurrent
  signups (two people claiming the same name in the same instant) — the
  database's case-insensitive unique index is the real tie-breaker; the
  client-side check is a fast-fail UX, not the security boundary, and is
  documented as such in the code.

## Testing (Step 12)

**Before this phase:** 72/72 (Phase 3 baseline).
**After:** **110/110.**

Distinguished explicitly, per instruction:

- **Unit tests** (pure logic, no mocking needed): `src/auth/username.test.ts`
  — normalization, length/character validation, comparison-normalization.
- **Mocked integration tests** (Supabase client replaced with hand-written
  fakes — prove authService/profileRepository's own logic is correct;
  prove nothing about a real Supabase project): `src/auth/
  authService.mocked.test.ts` (signup validation/availability/success/error
  mapping, sign-in success/failure, sign-out, password reset, session
  restoration including an expired-session case, auth-state-change
  subscription/unsubscription) and `src/services/profileRepository.test.ts`
  (load/save profile, save valuation for both evaluated and
  insufficient-evidence results, load saved valuations ordering, and all
  three migration branches plus a determinism check).
- **Static review, not live verification:** `src/security/
  rlsPolicies.test.ts` — parses the actual migration SQL and asserts RLS is
  enabled on every table, every policy references `auth.uid()`, no
  `using (true)`, no delete policy, no `service_role` reference. Its own
  header comment states plainly what this does and does not prove.
- **Real Supabase verification: NONE PERFORMED.** No project exists. This
  is stated here explicitly so it cannot be mistaken for having happened.
- **Auth navigation** (`App.test.tsx`): Welcome → Sign In → Sign Up → Back
  → Back → Welcome, asserting the honest "not available yet" notice
  appears and the submit buttons are disabled — real navigation through the
  real (unconfigured) app, not a mock.
- **Existing suite** (domain registry, engine, onboarding flow,
  About/How It Works/FAQ, DomainSelection) — all still pass unmodified.

## Build / Lint

- **Build:** PASS — `npm run build`, zero TypeScript errors, succeeds with
  no Supabase env vars set (confirms the "must still build without
  credentials" requirement).
- **Lint:** PASS — only the one pre-existing, unrelated `AppContext.tsx`
  fast-refresh warning (present before this phase, not touched by it).

## Responsive verification

Checked live in the production build (`scrollWidth === clientWidth`, no
horizontal overflow) at 375, 768, and 1440px on the Sign In screen,
including through the visual-bug fix above. 390/430/820/1024/1280 were not
independently re-checked this phase — the auth screens share the exact
phone-frame shell already verified overflow-free at all eight required
widths in the Phase 0-3 work, and nothing about this phase's changes alters
that shell.

## Files changed

`supabase/migrations/0001_init.sql` (schema fix + additions), `src/auth/
authService.ts` (error mapping, username checks), `src/auth/username.ts`
(new), `src/services/profileRepository.ts` (new), `src/state/AppContext.tsx`
(session state, migration trigger), `src/navigation/flow.ts` (3 new
ScreenIds + backdrop fix), `src/App.tsx` (screen registration + adapters),
`src/screens/Welcome.tsx` (account entry point + nav-wrap fix),
`src/screens/auth/AuthShell.tsx` (backdrop fix). New test files: `src/auth/
username.test.ts`, `src/auth/authService.mocked.test.ts`, `src/services/
profileRepository.test.ts`, `src/security/rlsPolicies.test.ts`, plus one
new test in `src/App.test.tsx`.

## Known limitations / explicitly NOT implemented

1. **No live Supabase project.** Everything above is prepared, unit- and
   mock-tested architecture — not a working, connected account system.
   Real sign-up, login, session persistence across a browser restart, RLS
   enforcement, and username-uniqueness-under-concurrency have **not** been
   verified against a real backend, because none exists.
2. **Public profile URLs** (`valpro.app/u/username`) — not implemented; no
   routing exists in this app at all (state-machine navigation only).
3. **OAuth / additional auth methods** — not implemented this phase;
   architected for (see Authentication section) but out of scope.
4. **Payments, subscriptions, public profiles, social features** — not
   started, per explicit instruction.
5. **No `updated_at` write path exists for `valuation_history`** — the
   column exists for schema-shape consistency; since valuations are
   immutable, nothing ever updates one.

## What's needed from you to move past this boundary

To turn any of this from "architecture" into "working": create a Supabase
project at supabase.com, run `supabase/migrations/0001_init.sql` against
it, then set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (from that
project's API settings) in a local `.env.local` (never commit it — already
git-ignored). Nothing else changes automatically — `isSupabaseConfigured`
flips to `true` and every screen above starts actually working against
that project. At that point the real, currently-unperformed verification
(Step 12's "real Supabase verification: none") becomes possible and should
be done before calling any of this production-ready.
