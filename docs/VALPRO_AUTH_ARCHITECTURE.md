# ValPro Auth Architecture (Phase 4 — prepared, not live)

## Status

**No live Supabase project exists.** Nothing in this document represents a
working, connected backend. Everything below was built and tested to the
extent possible without one, per explicit instruction: prepare the full
architecture locally, use env-var placeholders, never invent credentials,
never assume a cloud project exists.

The live app is completely unaffected — none of the files listed below are
imported by `App.tsx` or any reachable screen, confirmed by the production
build: bundle size did not change after adding them (Vite tree-shakes
unreached code). A user on the deployed site today sees exactly what they
saw before this work; there is no new "Sign In" button anywhere live.

## What's built

| Piece | File | What it does |
|---|---|---|
| Supabase client | `src/lib/supabaseClient.ts` | Lazily creates a client only if `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` are set. Exports `isSupabaseConfigured` (currently `false`). Never throws when unconfigured. |
| Auth service | `src/auth/authService.ts` | The one seam every screen/component should call through — `signUp`, `signIn`, `signOut`, `requestPasswordReset`, `getCurrentSession`, `onAuthStateChange`. Every function checks `isSupabaseConfigured` first and returns a typed `{ ok: false, reason: 'not_configured' }` result instead of throwing or silently no-op'ing. |
| Env template | `.env.example` | Placeholder `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — copy to `.env.local` (git-ignored) once a real project exists. No real values anywhere in the repo. |
| DB schema | `supabase/migrations/0001_init.sql` | `profiles` (id, username, timestamps) and `valuation_history` (one row per saved result, full `ValuationResult` as `jsonb`) tables, both with Row Level Security restricting every row to `auth.uid()`. Not yet applied to any project — this is the migration to run once one exists. |
| Sign In / Sign Up / Forgot Password UI | `src/screens/auth/{SignIn,SignUp,ForgotPassword,AuthShell}.tsx` | Full working forms (validation, loading state, error display) in the existing design system (`Backdrop`, `Button`, `TextField`). Each shows an explicit "Accounts aren't available yet" notice and keeps its submit button disabled while `isSupabaseConfigured` is false — they cannot mislead a user into thinking sign-in works. **Not wired into `ScreenId`/`SCREEN_ORDER`/`App.tsx`** — see "Why not wired in yet" below. |
| Tests | `src/auth/authService.test.ts`, `src/screens/auth/auth.test.tsx` | 11 tests covering the one thing genuinely verifiable without live credentials: every operation degrades gracefully (typed not-configured result, disabled submit buttons, no throws) rather than crashing or silently failing. |

## Why the auth screens aren't wired into navigation yet

Wiring a "Sign In" entry point into the live, deployed app right now would put
a reachable button in front of real users that can never succeed — there is
no backend for it to authenticate against. That's worse than not having the
feature yet. The components are fully built, tested in isolation, and
designed to accept simple callback props (`onBack`, `onSignedIn`,
`onGoToSignUp`, etc.) specifically so wiring them in later is a small,
additive change to `App.tsx`/`ScreenId` — not a rewrite.

**Also deliberately not built:** the "protected route" gate. Gating a screen
on a signed-in user only makes sense once accounts actually exist; building
that guard now would just be more unreachable code with nothing to protect,
and the master prompt itself says "do not unnecessarily require login before
the user can understand the product" — the entire onboarding-through-result
flow is intentionally usable with zero account, and that shouldn't change
even once auth exists.

## What's genuinely NOT verifiable without a real project

- An actual sign-up creating a real `auth.users` row and a matching
  `profiles` row.
- Login issuing a real session, and that session persisting across a reload.
- The RLS policies in `0001_init.sql` actually blocking cross-user access —
  this can only be proven against a real Postgres instance enforcing them.
- Password reset emails actually sending and the reset link working.
- `onAuthStateChange` firing on a real auth event.

None of these can be faked or asserted around — they need a live project.
This is not a gap in effort, it's a gap that only real credentials can close.

## To connect a real project (when ready)

1. Create a project at supabase.com.
2. Run `supabase/migrations/0001_init.sql` in the SQL editor (or via the CLI).
3. Copy `.env.example` to `.env.local`, fill in the Project URL and anon key
   from the project's API settings.
4. `isSupabaseConfigured` becomes `true` automatically — no code change
   needed. The Sign In/Sign Up/Forgot Password forms start actually working
   against the real backend immediately.
5. Wire the three screens into `ScreenId`/`SCREEN_ORDER`/`App.tsx` (e.g. a
   new "Account" entry point from Welcome, alongside the existing
   "Why ValPro Exists" side excursion).
6. Re-run this session's test suite plus a manual smoke test of real
   sign-up → login → session-persists-on-refresh → sign-out, since those are
   exactly the paths this document flags as unverifiable until now.
