# ValPro — Market Data Status

## Current Provider Architecture

- `src/types/marketEvidence.ts` — the data contract one piece of real evidence must satisfy: domain, role, specialization, industry, experience band, education level, institute tier, company tier, market/city-region, compensation (min/median/max + currency + period), provenance (source, source URL, evidence quality, methodology, sample size), freshness (date collected/added, stale-after), and the source's own `evidenceStatus`.
- `src/services/marketEvidenceProvider.ts` — the `MarketEvidenceProvider` interface (`queryEvidence(query) → available sources | honest unavailable reason`), covering every matching dimension above. `NoEvidenceProvider` is the only implementation today and reports every query unavailable.
- `src/types/market.ts` — `SUPPORTED_MARKETS` (currently `India` only) gates which markets the app will produce a value for at all, independent of currency support.

**Not yet wired into the valuation engine.** `evaluateProfile()` (`src/engine/valuationEngine.ts`) still reads `DomainPack.benchmark` directly — a static, hand-authored fixture, not any external API, so this isn't "hardwired to a website." Routing the engine through the provider would require it to become async everywhere it's called (every screen, every test); with zero real evidence sources to justify that change, it has not been made — the provider exists as the designated seam for when one does.

## Fixture / Development Data

All four calibrated benchmarks (**Technology, Banking, Education, Fresher**) are `dataSource: 'development_fixture'` (`src/types/domain.ts`) — hand-authored, not sourced from any survey or dataset. Every result they produce carries `marketEvidence: 'partial'`, surfaced to the user via the "Market Evidence: Partial" badge on Result/Share/Account/ValuationDetail (added in the post-fix integrity cleanup — see `docs/VALPRO_POST_FIX_CLEANUP_REPORT.md`). `marketEvidence: 'supported'` is reserved for a benchmark actually built from `MarketEvidenceSource` records — no domain uses it today.

## What Is NOT Real Market Intelligence

- `marketEvidenceSources` (`src/types/marketEvidence.ts`) is an **empty array** — zero real evidence records exist in this repository.
- The 31 non-benchmarked domains (Healthcare, Sales, Marketing, Legal, Engineering, Design, etc.) have no fixture either — they return an honest `insufficient` result.
- Nothing in the codebase claims a "verified" or "supported" number today, anywhere.

## Target-Market Behavior

`profile.location.targetMarket` is a constrained select (`SUPPORTED_MARKETS` or the `OTHER` "Not Listed" sentinel — see `src/types/market.ts`), not free text. `evaluateProfile()` checks it **before** computing anything: an explicit, unsupported market returns an honest `insufficient` result — regardless of domain — never a value silently computed against India's fixture data. Verified for all four benchmarked domains in `src/engine/valuationEngine.test.ts`'s `'target-market evidence gate'` suite. There is no fallback path from "unsupported market" to "use India data" anywhere in the engine.

## Next Integration Point for a Real Data Source

1. Populate `marketEvidenceSources` with real, citable `MarketEvidenceSource` records (never placeholders).
2. Implement a `MarketEvidenceProvider` (e.g. wrapping a licensed survey API) that queries those records and returns `{ available: true, sources }` only for dimensions actually covered — see the "MATCHING HONESTY" comment in `marketEvidenceProvider.ts`.
3. Wire `evaluateProfile()` (or a new async variant) to consult the provider before falling back to `DomainPack.benchmark`, flipping `dataSource` to `'verified_market_data'` and `evidenceStatus` to `'supported'` only for domains the provider actually backs.
4. Add the new market to `SUPPORTED_MARKETS` only once real evidence exists for it — never before.

No code change is required to "unlock" this later — the contract and boundary already exist; only real data and the provider implementation are missing.
