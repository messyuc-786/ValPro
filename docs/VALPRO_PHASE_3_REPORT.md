# ValPro Phase 3 Report — Domain Intelligence + Honest Market Data Architecture

## Objective

Expand ValPro from 4 domains into a scalable, honest domain-pack system, and
architect (not populate) the seam for future real market data — without
inventing benchmark numbers, without touching Welcome/Results visual design,
and without implementing Supabase auth.

## Audit summary (Step 1)

Read before any change:

- **`src/types/domain.ts`** — `DomainPack` was a single flat shape:
  `id/label/shortLabel/description/benchmarkStatus: 'demo'|'insufficient'/
  benchmark?`. No `category`, no data-source tagging, no three-tier
  evidence model.
- **`src/types/valuation.ts`** — `ValuationResult` was already a
  discriminated union (`DemoValuationResult | InsufficientEvidenceResult`)
  from earlier work, but only two states, and `InsufficientEvidenceResult`
  carried no structure beyond the bare status flag — no reason, no
  "what's missing", no suggested action.
- **`src/engine/valuationEngine.ts`** — genuinely domain-agnostic aside from
  one contained branch (`pack.id === 'technology' || 'fresher'` for an
  AI/ML gap suggestion). Confirmed deterministic (same input → same
  output), confirmed it already widens the range for lower confidence
  (`spreadFactor` 0.16/0.22/0.3 by confidence tier) — false-precision
  guarding already existed structurally, just wasn't documented as such.
- **`src/domains/{technology,banking,education,fresher}.ts`** — each a
  hand-authored `DomainBenchmark` under a header comment calling it demo
  data. No machine-checkable tag distinguishing fixture from real data —
  only a comment.
- **`src/domains/insufficientDomains.ts`** — the other 27 domains,
  generated from `DOMAIN_OPTIONS`, `benchmarkStatus: 'insufficient'`, no
  `benchmark`.
- **`src/screens/DomainSelection.tsx`** — a flat, unsearchable, ungrouped
  31-row list.
- **`src/screens/ResultOverview.tsx`** — the insufficient-evidence branch
  showed two fixed sentences, not the structured reason/missing-evidence/
  action data the brief now requires.
- **Optional fields** — Skills, Certifications, Achievements already never
  block "Next" (confirmed by reading each screen's footer button —
  no `disabled` tied to array length except Skills previously, fixed in a
  prior phase). No separate "Projects"/"Publications"/"Extracurricular"
  fields exist as distinct mandatory inputs — those are Achievement
  *categories* on one already-optional array, not separate gates.
- **Tests** — 51/51 passing at audit time, covering the 4 domains, the
  insufficient-evidence path (2-field version), onboarding navigation, and
  About/How It Works/FAQ.
- **UI assuming only 4 domains** — none found beyond the `ICONS` map in
  `DomainSelection.tsx`, which already had a generic-icon fallback for
  domains without a bespoke one.

## Architecture changes (Step 2)

`DomainPack` (`src/types/domain.ts`) gained:

- `category: string` — one of a fixed `DOMAIN_CATEGORIES` list, used for
  grouping/search in Domain Selection.
- `evidenceStatus: 'supported' | 'partial' | 'insufficient'` (renamed from
  `benchmarkStatus: 'demo' | 'insufficient'`). `'supported'` is a real,
  reachable state in the engine but no domain uses it yet — see Step 7.
- `DomainBenchmark.dataSource: 'development_fixture' | 'verified_market_data'`
  — a checkable field, not just a comment, marking every populated
  benchmark today as a fixture.

`ValuationResult` (`src/types/valuation.ts`) is now:

- `EvaluatedValuationResult` (`marketEvidence: 'supported' | 'partial'`) —
  identical numeric/explanatory shape either way; only the trust level
  differs, which is exactly what the field communicates to the UI.
- `InsufficientEvidenceResult` (`marketEvidence: 'insufficient'`) — now
  carries `reason`, `missingEvidence: string[]`, `suggestedAction`, and
  `profileCompletenessRatio`, per Step 5's structured-result requirement.

The engine (`evaluateProfile()`) remains domain-agnostic; it reads
`pack.evidenceStatus`/`pack.benchmark` and branches once. No domain-specific
logic was added to the engine itself.

## New data contract for future real evidence (Step 7)

`src/types/marketEvidence.ts` (new file): `MarketEvidenceSource` — source,
sourceUrl, evidenceQuality, methodology, sampleSize, domainId, role,
experienceBand, educationLevel, market, cityRegion, compensation
(min/max/currency/period), dateCollected, dateAdded, staleAfterMonths. An
exported empty array (`marketEvidenceSources: []`) demonstrates the
contract's shape is wired and ready. **Populated with zero entries** —
nothing in the app reads from it yet. Wiring it into a real benchmark is
future work once actual sourced data exists.

## Domains added (Step 3)

4 new domains: **Business**, **Design** (split out from the old combined
"Architecture / Design"), **Non-Profit / Social Sector**, **Career
Switcher** — bringing the total to **35** (4 with a development-fixture
benchmark, 31 marked insufficient). Existing domains from the prior phase
(Accounting, Government, Telecom, Data/Analytics, Product/Project
Management, Customer Success, Skilled Trades, Entrepreneur) were kept, not
removed — nothing working was replaced.

**Usability, not a wall of 35 rows:** `DomainSelection.tsx` gained a live
text-filter search box and category section headers (`DOMAIN_CATEGORIES`,
8 groups + "Other"), reusing the existing `TextField`/`OptionCard`
components and typographic language — no new visual system.

## Optional-field behavior (Step 4)

Audited, confirmed already correct: Skills, Certifications, and
Achievements never block progressing to the next screen (no `disabled` tied
to their length). No change required beyond what a prior phase already
did — this report just re-confirms it under Phase 3's explicit checklist,
with a new automated test.

## Evidence-state behavior (Step 5)

`ResultOverview.tsx`'s insufficient-evidence branch was rewritten (content
only — same `Backdrop`/typography/spacing as the working-result branch, no
new visual language) to show:

- the specific **reason** (names the domain),
- a **"What's Missing"** list,
- a **"What You Can Do"** section with a *real* action — a currently-working
  domain in the same category if one exists (e.g. Legal → Banking &
  Finance), or a broad-coverage fallback (Technology/Fresher) otherwise —
  never just "wait",
- the user's **profile completeness %**, so the message reads as "not yet
  possible for this domain" rather than "we don't have your information".

## Demo-data separation (Step 6)

Every existing benchmark now carries `dataSource: 'development_fixture'`
as data, not just a file-header comment — `docs/VALPRO_PHASE_3_REPORT.md`
(this file) and `registry.test.ts` both assert it. The seam for real data:
author a `DomainBenchmark` with `dataSource: 'verified_market_data'`
(ideally derived from `MarketEvidenceSource` entries), set the pack's
`evidenceStatus` to `'supported'`, register it in place of its
`insufficientDomains.ts` entry. The engine automatically reports
`marketEvidence: 'supported'` for it — verified by a test that flips this
flag on the real Technology benchmark and confirms the engine's output
changes accordingly, with no engine code change.

## Valuation integrity (Step 8)

Confirmed by test, not just inspection: `marketValueLPA` and its range never
carry more than one decimal place, and the range **widens** for
lower-confidence profiles rather than showing the same false-precise band
regardless of evidence strength. **Not changed:** the Result screen's
layout/typography, per the explicit "do not redesign Results" instruction —
the headline still shows one central number for a working result. Making
that number visually less "confident-looking" at Low confidence (per Step
8's framing) would mean changing that layout, which this phase was told not
to do — flagged below as a real, explicit gap, not silently addressed.

## Approved UI (Step 9)

Not touched: Welcome, ValPro branding, the backdrop system, the blue/white
type system, navigation style, About/How It Works/FAQ. The only visual
additions (Domain Selection's search box and category headers, Result's
richer insufficient-evidence text) reuse existing components and
typographic scale — no new colors, no new UI patterns.

## Tests

**Before:** 51/51 (prior phase).
**After:** **72/72.**

New coverage added this phase:

1. Domain registry completeness — every `DOMAIN_OPTIONS` entry has a
   registered pack (`registry.test.ts`).
2. Every pack's `category` matches its option, `evidenceStatus` is a valid
   value.
3. Only the 4 known domains carry a benchmark; every populated benchmark
   is tagged `development_fixture`.
4. All 4 newly-added domains (Business, Design, Non-Profit, Career
   Switcher) present with an honest `insufficient` status.
5. "Other" present as a real fallback domain.
6. No duplicate domain IDs; category breadth ≥ 8.
7. Insufficient-evidence result carries a real `reason`, non-empty
   `missingEvidence`, non-empty `suggestedAction`.
8. Suggested action recommends an evidenced same-category sibling when one
   exists (Legal → Banking), and falls back sensibly when none does
   (Marketing → Technology/Fresher).
9. `profileCompletenessRatio` reflects actual profile fill level even with
   no computable valuation.
10. The `'supported'` branch actually works end to end (flips a real
    benchmark's `dataSource`, confirms `marketEvidence` follows).
11. No more than 1 decimal of LPA precision anywhere in a result.
12. Range spread widens for lower confidence.
13. `DomainSelection` renders grouped by category, includes all 4 new
    domains, search filters correctly, empty-search state is helpful not
    blank.
14. Existing 4-domain evaluation, onboarding navigation, and
    About/How It Works/FAQ navigation — all still pass unmodified.

## Build / Lint

- **Build:** PASS — `npm run build`, zero TypeScript errors.
- **Lint:** PASS — `npm run lint`, only the one pre-existing, unrelated
  `AppContext.tsx` warning (not touched this phase).

## Responsive checks

Checked `scrollWidth === clientWidth` (no horizontal overflow) live, in the
production build, at 375, 390, 430, 768, 820, 1024, 1280, and 1440px, on
Welcome, Domain Selection (with the new search/grouping content), and the
enriched insufficient-evidence Result screen. All clean at every width.
Visually screenshotted at 375 and 1440 — grouped domain list and the
richer insufficient-evidence content both render within the existing
chrome, no clipping, no new visual language introduced.

## Known limitations

1. **No real market data exists.** All 4 populated benchmarks remain
   development fixtures. `marketEvidenceSources` is an empty array. Nothing
   in this phase should be read as "ValPro now has real market data" — it
   doesn't.
2. **Result's Low-confidence display isn't visually softened.** The engine
   already widens the range for low confidence (verified by test), but the
   headline number's typography doesn't change with confidence — Step 9's
   "do not redesign Results" instruction took precedence over Step 8's
   "must not look confident when evidence is weak" framing for this one
   specific case. A future Results-redesign phase should reconcile this.
3. **`suggestedAction`'s same-category fallback logic is simple** (same
   category → evidenced sibling; else Technology/Fresher) — it isn't a
   ranked recommendation engine, just a rule that guarantees a real, useful
   suggestion exists.
4. **Auth was explicitly out of scope this phase** and remains exactly as
   the prior phase left it (scaffolded, not live — see
   `docs/VALPRO_AUTH_ARCHITECTURE.md`).
5. **"Design" was split out of the old "Architecture / Design" combined
   domain** — existing users who had selected that combined domain
   (`architecture`) keep that selection; it isn't retroactively migrated to
   "Design", since there's no way to know which they meant.

## Explicitly NOT completed this phase

- Supabase authentication (excluded by instruction).
- Any redesign of Welcome or Results (excluded by instruction).
- Any real market data sourcing or ingestion — the contract exists, no data
  does.
- Wiring `marketEvidenceSources` into any domain's benchmark.
- A Low-confidence-specific visual treatment on the Result headline (see
  Known Limitations #2).
