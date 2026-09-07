# ValPro — Supabase Setup

Code is complete and ready (`src/lib/supabaseClient.ts`, `src/auth/authService.ts`, `src/services/profileRepository.ts`, `supabase/migrations/`). Nothing below requires a code change — only external configuration. Until you do this, the app runs exactly as it does today: local-only, no auth, no database.

1. **Create a Supabase project** at supabase.com — free tier is enough for development.
2. **Run the migrations**, in order, via the SQL editor (or `supabase db push`): `supabase/migrations/0001_init.sql`, then `0002_valuation_history_delete.sql`. This creates `profiles` + `valuation_history` with Row Level Security already enabled and the auto-provisioning trigger for new signups.
3. **Configure environment variables**: copy `.env.example` → `.env.local` (git-ignored), fill in from Project Settings → API:
   ```
   VITE_SUPABASE_URL=<your-project-url>
   VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
   ```
   Never use the service-role key here — the anon key is the only one meant for client code.
4. **Enable authentication providers**: Email/Password is on by default. For local testing, Authentication → Providers → Email → disable "Confirm email" so signup doesn't require a real inbox.
5. **Configure redirect URLs**: Authentication → URL Configuration → add your dev URL (`http://localhost:5173`) and your deployed URL (`https://<user>.github.io/ValPro/`) to the allow list — required for password-reset links to work.
6. **Test authentication**: Sign Up with a test email → should land signed-in; Sign Out → Sign In with the same credentials → should restore the session on reload (tests this exact flow: `src/auth/authService.test.ts`).
7. **Test profile persistence**: fill out an assessment while signed out (saved to `localStorage`), then sign up/in — `migrateLocalProfileToCloud` should copy it to `profiles.profile_data` once, without overwriting any existing cloud data on a second sign-in.
8. **Test valuation history**: after computing a result while signed in, confirm a row appears in `valuation_history` scoped to your user id, and that another test account cannot see it (RLS) or delete it (only via `deleteValuation`, owner-scoped).

See `docs/VALPRO_PRIVACY_SECURITY.md` for what is and isn't protected, and `docs/VALPRO_AUTH_ARCHITECTURE.md` for the auth flow design.
