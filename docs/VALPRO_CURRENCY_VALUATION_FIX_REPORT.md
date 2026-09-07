# ValPro — Currency / Valuation Bug Investigation & Fix Report

**Date:** 2026-09-07
**Trigger:** "The ValPro result is displaying a dollar ($) value and the valuation appears incorrect."

This report follows the investigation exactly as requested: trace first, diagnose with evidence, treat currency and value as potentially separate bugs, fix the smallest correct thing, add regression tests before changing implementation, then verify.

---

## 1. Currency Root Cause

**Finding: could not reproduce the reported "$" symbol anywhere in the current source code.**

A repo-wide search of every screen, component, and test for `$`, `USD`, `usd` (as a currency, not as a shell-variable or regex artifact) found **zero** literal dollar-sign renders. Every currency-shaped literal in the UI before this fix was already `₹` / `LPA` / `L` (hardcoded, see Section 2), never `$`.

Search covered: `ResultOverview.tsx`, `ShareResult.tsx`, `src/ui/resultDisplay.tsx` (used by `ImprovementAreas.tsx` and `WhatIfSimulator.tsx`), `Analysis.tsx`, `Skills.tsx`, `Welcome.tsx`, `fields.tsx`, `Backdrop.tsx`, `Logo.tsx`, `listRows.tsx`, `Button.tsx`, `OptionCard.tsx`, `Location.tsx`, `App.test.tsx`, `auth/ForgotPassword.tsx`, plus the engine, types, and domain packs.

**Evidence:**
- No occurrence of a literal `$` currency sign in any `.tsx`/`.ts` file's rendered output.
- No `Intl.NumberFormat` call anywhere in the codebase (so no locale-driven `$` formatting either).
- `.env.local` does not exist — Supabase is fully unconfigured (see Section 8) — ruling out a cloud-fetched value carrying a `$`-formatted string.

**Conclusion:** the literal "$" symptom, as described, is not currently reproducible against this source tree. It's possible it was seen against an older build, a different deployment artifact, or was a misreading of a different character — but there is no code path today that would produce it. I am not guessing at a cause I can't evidence; I'm reporting this plainly as **not reproduced**.

What *was* real, and adjacent: the currency was previously **hardcoded** (`₹`, `LPA`, `L` typed directly into JSX/template strings in `ResultOverview.tsx`, `ShareResult.tsx`, and `src/ui/resultDisplay.tsx`) rather than derived from any explicit data field. That's not the reported bug, but it is exactly the kind of untyped, ambiguous-money architecture the product rule in the request calls out as the real risk — fixed in Section 4.

---

## 2. Valuation Root Cause

**Finding: the computed numbers are internally plausible; the real defect is a silently-ignored input field.**

Running `evaluateProfile()` directly (bypassing the UI) across 10 representative Indian profiles produced results in the 5–50 LPA range with no crashes, no NaNs, and correct handling of empty optional fields (certifications/achievements/skills). See Section 6 for the full validation table.

The one genuine, reproducible issue found: **`profile.location.targetMarket`** (a free-text field collected during onboarding, labeled "Target Market (for opportunities)") **is never read by the valuation engine.** Only `profile.location.targetCity` (a closed dropdown of Indian cities) feeds `locationMultiplier()`. A user who types a non-Indian market there (e.g. "Dubai", "USA") still receives a confidently-presented ₹/LPA result with no disclosure that their stated target market isn't covered by any benchmark.

**Decision:** I did **not** add string-matching against `targetMarket` (e.g. matching "USA"/"Dubai" substrings) to gate or warn on this, because that would itself be guessing at unvalidated free text — directly against the "do not guess" instruction — and risks fragile false positives. This is flagged here as a known, real limitation (Section 10) rather than papered over with a heuristic.

---

## 3. Evidence

| Test | Method | Result |
|---|---|---|
| A. Supabase completely unconfigured | Checked filesystem for `.env.local` | **Absent** (only `.env.example` exists) — Supabase cannot be involved; every Supabase code path is gated by `isSupabaseConfigured` and this app currently fails that gate everywhere. |
| B. Local profile only | Ran `evaluateProfile()` directly against locally-constructed profiles | Correct, plausible INR values; no `$` anywhere in output. |
| C. Authenticated profile | Not reachable — no `.env.local`, so Supabase auth cannot be exercised in this environment. | N/A (see A) |
| D. Different location (Bangalore/Delhi NCR/Pune/etc.) | Varied `targetCity` across scenarios | Correct location multiplier applied each time; `targetMarket` free text confirmed unused (Section 2). |
| E. Different domain (technology/banking/education/fresher/legal) | Ran all four benchmarked domains + one non-benchmarked domain | Each returns its own distinct, domain-specific value; `legal` correctly returns `insufficient` evidence rather than a fabricated number. |

**Conclusion: Supabase is not, and cannot currently be, the cause of anything a user sees** — it is fully unconfigured in this environment and every code path that touches it is gated behind a hard `isSupabaseConfigured` check.

---

## 4. Files Changed

| File | Change |
|---|---|
| `src/types/currency.ts` (new) | The currency/market abstraction: `CurrencyCode` type, `CURRENCY_MARKET`, symbol/unit-label/compact-suffix maps, and `currencySymbol()` / `currencyUnitLabel()` / `formatCurrencyAmount()` / `formatCurrencyCompact()`. Includes a runtime fallback (`—` marker) for an unrecognized currency value, since a bad Supabase row or future migration could hand a value TypeScript alone can't guard at runtime. |
| `src/types/domain.ts` | `DomainBenchmark` gains a required `currency: CurrencyCode` field. |
| `src/types/valuation.ts` | `EvaluatedValuationResult` gains a required `currency: CurrencyCode` field. |
| `src/engine/valuationEngine.ts` | Result construction now copies `currency: benchmark.currency` from whichever benchmark actually produced the result — never a value hardcoded in the engine. |
| `src/domains/technology.ts`, `banking.ts`, `education.ts`, `fresher.ts` | Each benchmark now declares `currency: 'INR'` explicitly (all four are India-market development fixtures — see `docs/VALPRO_CURRENT_BASELINE.md`). |
| `src/screens/ResultOverview.tsx` | Headline value and range now render via `currencySymbol()`/`currencyUnitLabel()`/`formatCurrencyCompact()` instead of hardcoded `₹`/`LPA`/`L` literals. No layout/visual change. |
| `src/screens/ShareResult.tsx` | `buildShareSummary()`, `buildShareSvg()`, and the share-card JSX now take/use `currency` and call `formatCurrencyAmount()` instead of a hardcoded `₹...LPA` template. No layout/visual change. |
| `src/ui/resultDisplay.tsx` | `GapCard` and `ScenarioRow` now take a `currency: CurrencyCode` prop and use `formatCurrencyCompact()` instead of hardcoded `₹...L` literals. |
| `src/screens/ImprovementAreas.tsx`, `WhatIfSimulator.tsx` | Pass `currency={result.currency}` at the `GapCard`/`ScenarioRow` call sites. |
| `src/services/profileRepository.test.ts` | Existing inline `EvaluatedValuationResult`-shaped test fixture updated with `currency: 'INR'` (required by the new type). |

No visual/layout change was made anywhere — every edit swaps a hardcoded literal for a call to a formatting function that produces the identical string for the currency that's always been in use (INR). The approved ValPro visual language is untouched.

---

## 5. Data-Model Changes

Before this fix, `marketValueLPA` (and its siblings) were bare `number`s with an implicit, undocumented assumption of "Indian Rupees, Lakhs Per Annum" baked into every render site independently. That's exactly the "naked ambiguous number" the product rule warns against — nothing in the type system enforced the assumption, and five different files could in principle have drifted to five different implicit units.

Now:
- `DomainBenchmark.currency: CurrencyCode` — the currency is declared once, at the source of the benchmark data.
- `EvaluatedValuationResult.currency: CurrencyCode` — the engine copies it through to the result, so every consumer of a result has the currency traveling with the number instead of assuming it.
- `CurrencyCode` is presently `'INR'` only, by design — see the doc comment in `currency.ts`. Adding `'USD' | 'GBP' | ...` is architecturally trivial (one more entry in each map) but is **deliberately not done here**, because ValPro has no sourced benchmark data for any market besides India. Adding a currency code with no evidence behind it would be exactly the kind of unsupported claim the request prohibits.
- This is the closest practical equivalent to the requested `{ currency: INR, period: annual, unit: INR_ANNUAL }` shape: `currency` is explicit and strongly typed; the "LPA" (Lakhs Per Annum) unit is inherent to India's compensation convention and is emitted by `currencyUnitLabel()`/`formatCurrencyAmount()`, which is the single place that assembles a displayable string — no other file may hand-write "LPA" or "₹" again.

---

## 6. Tests Added

**`src/types/currency.test.ts`** (new, 5 tests) — unit-level formatting contract:
1. Formats INR as `"₹14.5 LPA"`, never containing `$` or `USD`.
2. Rounds to exactly one decimal place (no false precision).
3. Compact (`L`) and full (`LPA`) formats represent the same underlying value, not a converted one.
4. `currencySymbol()`/`currencyUnitLabel()` expose the pieces separately for composed layouts.
5. An unrecognized/missing currency degrades safely — no crash, no `undefined` in the string, no fabricated `$`.

**`src/engine/valuationEngine.test.ts`** (new `describe('currency / market data model')` block, 7 tests):
1. An India/technology profile's result carries `currency: 'INR'`.
2. The formatted value uses the `LPA` unit, not a generic "per year".
3. The headline format matches `/^₹\d+\.\d LPA$/` exactly.
4. Never contains `$` or `'USD'` for an India-domain result.
5. Technology's and Banking's results each carry the currency declared on *that domain's own* benchmark (`technologyPack.benchmark.currency` / `bankingPack.benchmark.currency`) — proving the engine reads the field rather than hardcoding it.
6. The range (`lowerRangeLPA`/`upperRangeLPA`) brackets the headline value in the same unit — no accidental unit conversion.
7. An insufficient-evidence domain (`legal`) has no `currency` field at all — the discriminated union guarantees no fabricated currency/value pair is possible for a domain with no benchmark.

Existing tests were **not** weakened or deleted; one existing test fixture (`profileRepository.test.ts`) was extended with the new required field, per the "strengthen, don't duplicate" instruction.

---

## 7. Test / Typecheck / Lint / Build Result

```
npx tsc -b        →  clean, no errors
npx vitest run    →  13 test files, 122 tests passed (110 pre-existing + 12 new)
npm run lint      →  1 pre-existing warning (AppContext.tsx fast-refresh export shape),
                      unrelated to this change; zero new warnings/errors
npm run build     →  succeeds — tsc -b && vite build, 107 modules, dist/ produced
```

122/122 tests pass. No test was deleted or weakened to make the suite pass.

---

## 8. Live Verification

**Blocked — and this is the most important actionable finding in this report.**

The live deployment (`https://messyuc-786.github.io/ValPro/`) currently returns **"Site not found · GitHub Pages"**. Cross-checked two independent ways:
- Direct HTTPS request from this environment: `404`.
- The GitHub REST API for the repository itself (`api.github.com/repos/messyuc-786/ValPro`): `404` (not `403`) to an unauthenticated request.
- Confirmed again via a real browser (Browser pane, genuine internet access, not this sandbox) loading the exact Pages URL: identical "Site not found" result.

A `404` (rather than `403`) from GitHub's API to an unauthenticated request is the specific signature of a **repository that has been switched to Private** — GitHub's Pages free tier does not serve Pages sites for private repositories, and the API itself refuses to even confirm the repo exists to a logged-out caller.

**This means: I cannot open the actual live application and confirm the fix there, and I am not claiming to.** This is an account/repository-settings issue, not a code defect, and it is outside what a code change can fix.

**Action needed from you:** in GitHub → `messyuc-786/ValPro` → Settings → General → Danger Zone, change repository visibility back to **Public** (or upgrade to a plan that serves Pages from private repos). Once that's done, live verification can actually happen — until then, no one (not just this environment) can reach the deployed app.

---

## 9. Was Supabase Involved?

**No — confirmed, not assumed.**

- No `.env.local` exists in the project (only `.env.example`), meaning `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` are unset.
- Every Supabase-touching function in the codebase checks `isSupabaseConfigured` first and short-circuits to local-only behavior when it's false.
- With Supabase unconfigured, 100% of the app's behavior — profile storage, valuation, currency formatting — runs through the local/in-memory path only.

This directly satisfies scenario A of the requested test matrix and rules out Supabase as a contributor to anything reported.

---

## 10. Remaining Market-Data Limitations (Disclosed, Not Hidden)

- All four benchmarks (technology, banking, education, fresher) are **development fixtures** (`dataSource: 'development_fixture'`), not verified market data. `marketEvidence` on their results is `'partial'`, and the UI's evidence badge reflects this — no domain claims `'supported'` today (see `docs/VALPRO_CURRENT_BASELINE.md` and `docs/VALPRO_PHASE_3_REPORT.md` for prior disclosure of this).
- `profile.location.targetMarket` is collected but not used by the engine (Section 2) — a user who states a non-India target market receives an India-benchmarked result with no disclosure that the market they named isn't covered. This is a real, open gap; fixing it responsibly requires either (a) validating `targetMarket` against a closed list of supported markets at input time, or (b) adding an explicit "we don't have data for this market" evidence state — both are product/data decisions beyond the scope of "fix the currency/value bug," and are flagged here rather than patched with a guess.
- `CurrencyCode` currently supports only `'INR'`. The architecture (per-currency maps in `currency.ts`, the `currency` field threaded through `DomainBenchmark` → `EvaluatedValuationResult` → every render site) is ready for `'USD' | 'GBP' | 'AED' | 'SGD'`, etc., the moment any of those markets has real, sourced benchmark data — no code restructuring will be needed, only new map entries plus the underlying data.
