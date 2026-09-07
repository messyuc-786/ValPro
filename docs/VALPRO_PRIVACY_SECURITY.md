# ValPro — Privacy & Security

## What's Stored, and Where

**Anonymous (no sign-in, the default today — no live Supabase project exists):** the full ValPro `Profile` (education, experience, skills, certifications, achievements, location) lives only in the browser's `localStorage` (`src/state/persistence.ts`). Nothing is sent to any server. Clearing site data or using a different browser/device loses it.

**Authenticated (once a Supabase project is configured):** the same profile additionally syncs to the `profiles.profile_data` column, and saved valuations to `valuation_history`, both scoped to the signed-in user's own row by Row Level Security (`supabase/migrations/0001_init.sql`, `0002_valuation_history_delete.sql`) — `auth.uid() = id` / `auth.uid() = user_id` on every policy, enforced by Postgres itself, not just app code. A Supabase outage/misconfiguration falls back to the local copy silently (`profileRepository.ts` never throws outward) — no data loss, no crash.

**Never stored anywhere:** passwords (handled entirely by Supabase Auth, never touched by ValPro code), the Supabase service-role key (never referenced in any frontend file — `src/security/rlsPolicies.test.ts` asserts the migration SQL never contains `service_role`), payment details (ValPro has no payment flow).

## Deletion

- **Local profile:** `restart()` (AppContext) clears `localStorage` immediately — always available, no network dependency.
- **A saved valuation:** `deleteValuation()` (`profileRepository.ts`), enforced by the new owner-scoped delete RLS policy — a user can only delete their own rows.
- **Cloud profile row / account:** no client-side delete path today, by design — `0001_init.sql` deliberately omits a delete policy on `profiles` (an anon-key client must never be able to delete auth-linked data). Full account deletion would need a server-side admin action (a Supabase Edge Function using the service-role key, invoked only from trusted server code, never the browser) — **not implemented**, flagged here rather than silently promised.

## Sharing

The Share Result card/export (`ShareResult.tsx`) carries only: the market value range, profile-strength score, market-evidence tier, and the result date — no email, user ID, name, or profile detail ever appears in the shared text/SVG. No public database record is created; "Copy Link" copies a local text summary, not a hosted URL (the UI already says so).

## Known Limitations (Disclosed)

- No account-deletion flow yet (see above).
- No data-export ("download my data") flow yet.
- localStorage is unencrypted, as it is for any browser-only app — a shared/public machine can expose whatever profile data is stored there. Not a concern the app can solve client-side; not treated as private beyond "protect it from other websites," which the browser's origin isolation already does.
