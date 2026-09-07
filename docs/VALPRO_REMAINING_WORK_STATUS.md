# ValPro — Remaining Work Status

## CODE COMPLETE
- Post-fix integrity cleanup (percentile removal, honest labels)
- Currency/valuation architecture
- Target-market evidence gate (`src/types/market.ts`)
- Market evidence schema + provider abstraction (not yet wired into engine — no real source to wire to)
- Supabase migrations (profiles, valuation_history, RLS, delete policy)
- Profile persistence (local + cloud, load/save/migrate)
- Valuation save/load/delete repository functions
- Auth flows: sign up, sign in, sign out, forgot password, session restore

## EXTERNAL CONFIG REQUIRED
- A live Supabase project (no `.env.local` exists) — see `docs/VALPRO_SUPABASE_SETUP.md`
- Redirect URLs / auth provider settings in the Supabase dashboard
- Google OAuth (frontend not blocked on this, but no live project to test against either way)

## REAL DATA REQUIRED
- Any domain reaching `marketEvidence: 'supported'`
- Any market beyond India

## MANUAL QA REQUIRED
- Full 8-domain browser walkthrough (Technology/Banking/Education/Healthcare/Sales/Finance/Design/Legal) beyond what's automated
- Responsive sweep at 320/375/390/430/768/1024/1440px

## NOT IMPLEMENTED
- Account/Dashboard screen (profile summary, valuation history list, re-run, sign out UI) — repository functions it would call (`loadSavedValuations`, `saveValuation`, `deleteValuation`) are code-complete and tested, but no screen calls them yet, and nothing currently calls `saveValuation` after a result is computed
- Account/data deletion flow (server-side, would need an Edge Function — see `docs/VALPRO_PRIVACY_SECURITY.md`)
- Data-export ("download my data")
- Google OAuth frontend wiring

These were deprioritized this sprint per the P0/P1/P2 order in the sprint brief — the dashboard in particular is real, scoped feature work (new screen, new nav entry, new loading/empty states) rather than a fix, and building it quickly risked a half-correct result. Flagged honestly here rather than claimed done.
