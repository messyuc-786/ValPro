# ValPro — Post-Fix Integrity Cleanup Report

**Date:** 2026-09-07
**Scope:** Cleanup only, following the completed and live-verified currency/valuation fix (`docs/VALPRO_CURRENCY_VALUATION_FIX_REPORT.md`). No new domains, no real market data, no engine rewrite, no visual redesign, no Phase 5 work.

## Status
**COMPLETE**

---

## Documentation Cleanup

`docs/VALPRO_CURRENCY_VALUATION_FIX_REPORT.md` Section 8 had accumulated stale, contradictory status lines as the live-verification blocker was found and resolved across several messages in the same session ("Blocked", then "Site not found", then an "Action needed from you" telling the user to change repo visibility — left in place even after they had already done so). Rewrote Section 8 to represent the final state only:

- Leads with **`LIVE VERIFICATION: PASSED`** and a clean checklist (repo Public, Pages enabled, site returns 200, full flow completed, all four post-result screens verified).
- The full investigation trail (private repo → 404, then Pages never enabled → 404 again, then both fixed) is preserved but moved into a collapsed `<details>` block explicitly labeled **"Earlier investigation — resolved"**, so a reader gets the final answer first and the history only if they want it.
- Removed every standalone "blocked" / "action needed" statement that no longer reflects reality.
- Added a new Section 11 cross-referencing this report.

---

## Market Claim Audit

Searched the full source tree (`src/`, not just the Result screen) for: `Top X%`/percentile language, market-ranking or market-demand claims, accuracy/verified-market claims, and any confidence wording that could be read as statistical.

**Found and fixed:**
- `ResultOverview.tsx` — "Market Position: Top X%" stat tile (rendered on every successful result).
- `ShareResult.tsx` — the same "Top X%" claim, duplicated three times: the on-screen share card, the downloadable SVG image, and the copied text summary.
- `ResultOverview.tsx` / `ShareResult.tsx` — "Market Score" label, which reads as a validated market metric but is a deterministic function of the profile/engine only.
- `ResultOverview.tsx` — "Confidence" label on a value that is actually profile-completeness-derived, not statistical confidence.
- `Faq.tsx` — one FAQ answer referencing "a stated confidence level," which would have contradicted the corrected Result-screen wording.

**Checked and found clean** (no unsupported claims present): `HowItWorks.tsx`, `WhyThisValue.tsx`, `Welcome.tsx`, `Analysis.tsx` (the "Market benchmarking" processing-step label is a transient loading-sequence caption describing what the engine does internally, not a claim about the result's validity — left as-is), `DomainSelection`, and all domain pack files.

---

## Changes

| File | Change | Why |
|---|---|---|
| `src/ui/resultDisplay.tsx` | Added `MarketEvidenceBadge` component (renders the result's actual `marketEvidence` value: "Partial" or "Supported"); added a doc comment on `ConfidenceBadge` clarifying it shows evidence strength, not statistical confidence. | Replaces the removed percentile tile with an honest, already-existing data point instead of leaving a gap. |
| `src/screens/ResultOverview.tsx` | `StatRow` now shows "Profile Strength Score" / "Market Evidence" (via `MarketEvidenceBadge`) / "Evidence Strength" — the middle "Market Position: Top X%" tile is gone. Extended the disclosure line to mention "against a development-stage benchmark" and "not a guaranteed salary, offer, or verified market statistic." | Removes the percentile claim; renames the two mislabeled stats; strengthens the existing disclosure copy without adding a new banner. |
| `src/screens/ShareResult.tsx` | `buildShareSummary()` and `buildShareSvg()` now take `marketEvidence` instead of `topPercent`, and emit "Profile Strength X/100" + "Market Evidence: Partial/Supported" instead of "Market Score X/100" + "Top X%". Component JSX updated to match. | The share card and its exported image/text are user-facing artifacts that leave the app (downloaded, shared, pasted) — they needed the same correction as the on-screen result. |
| `src/types/valuation.ts` | Added doc comments on `score` and `percentileTopPercent` explaining what each actually represents and that `percentileTopPercent` must not be rendered anywhere. | Documents the decision at the data-model level so it isn't silently reintroduced later. |
| `src/screens/Faq.tsx` | One answer's "a stated confidence level" → "a stated evidence strength ... not a statistically validated market statistic." | Keeps FAQ copy consistent with the corrected Result-screen terminology. |
| `src/App.test.tsx` | Strengthened the existing end-to-end test with integrity assertions (see Tests below). | Regression coverage for the claims removed/renamed. |
| `src/ui/resultDisplay.test.tsx` (new) | 2 unit tests for `MarketEvidenceBadge`. | Direct coverage of the new component. |

No visual/layout redesign: `StatRow`/`StatTile` are the same components in the same 3-column layout: only the labels and the middle tile's content changed. No color, spacing, or typography was touched.

---

## Market Score

`score` (0-100) is computed entirely from the profile and the domain's fixture benchmark: `40 + ((marketValue - baseValueLPA) / benchmarkSpreadLPA) * 100`, clamped to `[8, 98]` (`src/engine/valuationEngine.ts`). It is deterministic and reproducible for a given profile, but it is **not** derived from, or validated against, any real population of market outcomes.

**Decision:** renamed to **"Profile Strength Score"** everywhere it's displayed (Result screen, Share Result screen, Share Result card/SVG/text export). The underlying calculation, the field name (`score`) in the data model, and every test asserting its numeric bounds are **unchanged** — only the user-facing label changed, per the instruction not to invent a new methodology or change the calculation to make the number look better.

---

## Percentile / Ranking

**Confirmed removed.** "Top X%" (`percentileTopPercent`, itself just `100 - score` — the same fixture-derived number re-expressed, not an independent market statistic) no longer appears anywhere in rendered UI or in any exported/shared content:
- Result screen's stat row — removed, not replaced with a different percentage.
- Share Result screen's card — removed.
- The downloadable SVG share image — removed.
- The copied/shared text summary — removed.

The `percentileTopPercent` field itself remains in `EvaluatedValuationResult` and is still computed by the engine (kept for potential future internal/analytics use, and because removing it outright would be an engine-model change beyond "remove an unsupported claim from the UI"), but it is now documented as **not to be rendered** until a domain has real, sourced market data — see the doc comment added in `src/types/valuation.ts`. A new test (`App.test.tsx`) asserts no `/top \d+%/i` text appears anywhere in the Result or Share screens.

---

## Evidence

The three-tier evidence architecture (`supported` / `partial` / `insufficient`) is **unchanged** and was not weakened:
- A domain with no calibrated benchmark still returns an honest `InsufficientEvidenceResult` (reason, missing evidence, suggested action, profile-completeness ratio) — no fallback number is ever fabricated.
- A domain with a development-fixture benchmark still returns `marketEvidence: 'partial'` — now additionally surfaced to the user via the new "Market Evidence" stat tile (previously this value existed on the result object but was never shown anywhere in the success path).
- `marketEvidence: 'supported'` is reserved, as before, for a benchmark actually built from verified market data — no domain uses it today, and nothing here fabricates that state.

Separately, `confidence` (`Low`/`Medium`/`High`, derived from profile-completeness ratio) is now labeled **"Evidence Strength"** instead of "Confidence" everywhere it's shown, since it measures how much of the profile backs the estimate, not statistical certainty. Same three values, same calculation, honest label.

---

## Fixture Disclosure

For the four currently benchmarked domains (Technology, Banking, Education, Fresher), the values remain development fixtures (`dataSource: 'development_fixture'`), unchanged by this cleanup. Disclosure now happens in two places on every successful result, using existing product language rather than a new warning banner:
1. The **"Market Evidence: Partial"** stat tile (new — see above), using the result's real `marketEvidence` value.
2. The extended disclosure line beneath the stat row: *"Estimated and modeled from your profile signals against a development-stage benchmark — indicative, not a guaranteed salary, offer, or verified market statistic."*

No giant warning banners were added, and no existing screen was restructured — both changes reuse the existing stat-tile and disclosure-line patterns already in place.

---

## Target Market

**Unchanged, still documented as a known limitation** (originally found during the currency fix investigation, Section 2 of `VALPRO_CURRENCY_VALUATION_FIX_REPORT.md`): `profile.location.targetMarket` is collected as free text during onboarding but is never read by the valuation engine — only `profile.location.targetCity` (a closed dropdown) affects the computed value. Per the explicit instruction for this cleanup, **no string-matching heuristic was added** (e.g. detecting "Dubai"/"USA" substrings) — that would be guessing at unvalidated free text. This remains flagged for a future market-data phase, not patched here.

---

## Tests

- **Before:** 122 tests, 13 test files
- **After:** 124 tests, 14 test files
- **Passed:** 124/124
- **Failed:** 0

**What changed and why:**
- `src/App.test.tsx` — strengthened the existing "walks from Welcome through onboarding into the Result screens" end-to-end test with new assertions (no new test case, so no count change from this file): no `/top \d+%/i` text anywhere on the Result screen or the Share card; "Profile Strength Score", "Market Evidence", "Partial", and "Evidence Strength" labels are present; the extended disclosure copy is present.
- `src/ui/resultDisplay.test.tsx` (new file, +2 tests) — direct unit coverage for the new `MarketEvidenceBadge` component (renders "Partial" for a `partial` result, "Supported" for a `supported` result, never a percentile).

No existing test was deleted or weakened. Every test that passed before this cleanup still passes unmodified, including the full currency-fix regression suite (`currency.test.ts`, the `currency / market data model` block in `valuationEngine.test.ts`, etc.).

---

## Build

```
npx tsc -b        →  clean, no errors
npx vitest run    →  14 test files, 124 tests passed
npm run lint      →  1 pre-existing warning (AppContext.tsx fast-refresh export shape,
                      unrelated to this cleanup); zero new warnings/errors
npm run build     →  succeeds — tsc -b && vite build, 107 modules, dist/ produced
```

---

## Live Verification

Deployed via `npm run deploy` (build + `gh-pages -d dist`) and re-verified directly against `https://messyuc-786.github.io/ValPro/` (site was already Public with Pages enabled from the prior fix's live verification — no repo-settings changes were needed for this cleanup):

- Site returns `200`.
- Ran the assessment flow fresh (`localStorage` cleared first) through to Result.
- **Result screen (live):** shows `₹` currency formatting with no `$`; shows "Profile Strength Score", "Market Evidence: Partial", "Evidence Strength" — **no "Top X%" or "Market Score" text present anywhere**.
- **Value Gaps screen (live):** unchanged currency-aware `GapCard` rendering, no percentile claim (this screen never showed one).
- **What-If screen (live):** unchanged currency-aware `ScenarioRow` rendering, no percentile claim.
- **Share Result screen (live):** share card shows "Profile Strength" and "Market Evidence: Partial" — the old "Top X%" tile is gone; no visual/layout shift beyond the label and content swap in that one card position.
- No visual/layout regression observed anywhere: same `StatRow`/`StatTile` structure, same typography, same spacing, same color tokens — only label text and the middle tile's content changed.

---

## Visual Regression

**None.** No component was restructured, no CSS class changed, no spacing/typography/color token was touched. The only visual difference on the Result and Share Result screens is the text inside the existing stat tiles (label + value), which is exactly the scope of this cleanup.

---

## Phase 5 Readiness

**Ready to proceed to Phase 5 — Real Market Intelligence Foundation.**
