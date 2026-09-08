# ValPro — Remaining Work Status

*(Updated after: Supabase connection, Account/Dashboard sprint, Market Data/Evidence sprint. Supersedes earlier versions of this file, which described Supabase as unconnected and Account as not implemented — both are now done.)*

## CODE COMPLETE
- Currency/valuation architecture; post-fix integrity cleanup (honest labels, no percentile claim)
- Target-market evidence gate (`src/types/market.ts`) — verified across all 4 benchmarked domains
- Market evidence contract + provider abstraction (`src/types/marketEvidence.ts`, `src/services/marketEvidenceProvider.ts`) — schema and boundary complete; not wired into the engine (no real source to wire to yet, by design)
- Supabase: connected to a real project, migrations applied (profiles, valuation_history, RLS, delete policy)
- Auth: sign up, sign in, sign out, forgot password, session persistence — all live-verified against the real project
- Profile persistence (local + cloud, load/save/migrate)
- Valuation persistence: save (auto-saved on reaching Result while signed in), list, delete — all live-verified
- Account/Dashboard screen: profile summary, valuation history (loading/empty/error states), open historical snapshot (read-only, never recalculated), delete with confirmation — all live-verified

## EXTERNAL CONFIG REQUIRED
- Supabase Site/Redirect URLs are set to `localhost:3000`; this project's dev server runs on port 5199 — fine for Sign Up/Sign In, but would break a password-reset email link until updated in the Supabase dashboard
- Google OAuth (no code blocker, but requires provider configuration in the Supabase dashboard that hasn't been done)

## REAL DATA REQUIRED
- Any domain reaching `marketEvidence: 'supported'`
- Any market beyond India — see `docs/VALPRO_MARKET_DATA_STATUS.md` for the exact integration point

## MANUAL QA REQUIRED
- Full domain-by-domain browser walkthrough beyond Technology (Banking/Education/Healthcare/Sales/Marketing/Legal/Engineering/Design) — automated tests cover the insufficient-evidence path for all of these; a visual pass has not been done
- Responsive sweep at 320/375/390/430/768/1024/1440px for the newer Account/ValuationDetail screens specifically

## NOT IMPLEMENTED
- Account/data deletion flow (server-side, would need a Supabase Edge Function using the service-role key — never the browser client)
- Data-export ("download my data")
- Google OAuth frontend wiring (blocked on the dashboard config above, not on code)
- Public/shareable result URLs (Share currently produces a local text summary + downloadable image, not a hosted link — a public link would need new backend storage, not attempted)
- Inline profile editing from Account (currently routes back into the existing onboarding flow to edit, since no dedicated editor existed to reuse)
