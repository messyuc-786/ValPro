# ValPro — Market Data Architecture

Foundation for real market evidence, without fabricating any. No new domains, no invented benchmarks — this documents the architecture that lets real data slot in later.

## Evidence Schema

`src/types/marketEvidence.ts` — `MarketEvidenceSource`: domain, role, specialization, industry, experience band, education level, company tier, market, city/region, a `CompensationRange` (min/max/median, currency, period), plus provenance (source, source URL, evidence quality, methodology, sample size) and freshness (date collected, date added, stale-after). All optional fields are nullable — never required to exist before they can legitimately be known. `marketEvidenceSources` is empty by design: populated only when real, citable data exists.

## Provider Abstraction

`src/services/marketEvidenceProvider.ts` — `MarketEvidenceProvider` interface (`queryEvidence(query) → available evidence | honest unavailable reason`). The only implementation today, `NoEvidenceProvider`, reports every query unavailable. **Not yet wired into the valuation engine** — the engine still reads `DomainPack.benchmark` directly (a static fixture, not any specific external API, so nothing is "hardwired to a website"). Wiring a real provider in means the engine consumes normalized `MarketEvidenceSource[]` through this interface instead of a provider-specific integration — that migration is future work once a real source exists.

## Target-Market Gate

`src/types/market.ts` — `SUPPORTED_MARKETS` (currently `[India]` only) is the single gate for "does ValPro actually have evidence for this market" — separate from `CurrencyCode` (src/types/currency.ts) supporting a currency type-wise. `profile.location.targetMarket` (`src/screens/Location.tsx`) is now a constrained select: a supported market, the `OTHER` ("Not Listed") sentinel, or unset. `evaluateProfile()` (`src/engine/valuationEngine.ts`) checks membership before computing anything — an explicit unsupported market returns an honest `insufficient` result, never an India-fabricated number. No string-matching on free text. See `docs/VALPRO_CURRENCY_VALUATION_FIX_REPORT.md` Section 2 for the original finding this fixes.

## Activating a New Market

1. Add real, sourced `MarketEvidenceSource` records for that market.
2. Add its `SupportedMarket` entry (`src/types/market.ts`) and, if a new currency, its `CurrencyCode`/formatter entries (`src/types/currency.ts`).
3. Build/calibrate a `DomainBenchmark` for that market's domains — until then, do **not** add the market here; the type system supporting a currency is not evidence.
