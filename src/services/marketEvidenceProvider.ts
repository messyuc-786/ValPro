import type { MarketEvidenceSource } from '../types/marketEvidence'
import type { InstituteTier } from '../types/domain'

/**
 * The abstraction boundary between the valuation engine and WHERE market
 * evidence actually comes from. Today the engine reads DomainPack.benchmark
 * directly (a static, hand-authored development-fixture calibration built
 * from zero MarketEvidenceSource records — see docs/VALPRO_CURRENT_BASELINE.md)
 * — it is not hardwired to any specific external website or API, so there is
 * nothing unsafe about that today. This interface exists so that whenever a
 * real evidence source (a survey API, a licensed dataset, a scraped-and-
 * verified feed) is added, the engine can be pointed at normalized evidence
 * through this contract instead of a provider-specific integration leaking
 * into src/engine/valuationEngine.ts.
 *
 * NOT YET WIRED INTO THE ENGINE. Implementing this only becomes useful once
 * a real evidence source exists — until then, any implementation MUST behave
 * exactly like `NoEvidenceProvider` below: report evidence honestly
 * unavailable, never synthesize a source, sample size, or date to satisfy
 * the interface's shape.
 */
export interface MarketEvidenceQuery {
  domainId: string
  role?: string
  specialization?: string
  industry?: string
  experienceBand?: string
  instituteTier?: InstituteTier
  companyTier?: string
  market: string // must match a SupportedMarket.id (src/types/market.ts)
  cityRegion?: string
}

/**
 * MATCHING HONESTY — for whoever implements a real provider later:
 * every dimension above is optional on the query for a reason (the caller
 * may not know a person's specialization/companyTier/etc.), but a matched
 * `MarketEvidenceSource` must never be presented as though it satisfied a
 * dimension it didn't actually have data for. A source with no
 * `specialization` is evidence for "this role in general," not silently
 * "this role with this specialization" — return it, but the caller (the
 * eventual engine integration) must weight/label it as broader, less
 * specific evidence, exactly the same distinction `EvidenceStatus`
 * ('supported' vs 'partial') already makes for benchmark-level confidence.
 * Do not add a matching implementation here speculatively — there is
 * nothing to match against yet (`marketEvidenceSources` is empty); this
 * comment exists so the requirement isn't lost by the time there is.
 */

export type MarketEvidenceQueryResult =
  | { available: true; sources: MarketEvidenceSource[] }
  | { available: false; reason: 'no_evidence_for_market' | 'no_evidence_for_domain' | 'provider_unavailable' }

export interface MarketEvidenceProvider {
  /** Human-readable name for attribution/debugging — never shown to the
   * user as if it were a market credential unless it genuinely is one. */
  readonly name: string

  /** Fetches and normalizes whatever evidence exists for the query. Must
   * never throw for "no data" — that is `{ available: false, ... }`, not an
   * exception. Reserve exceptions for actual transport/parsing failures. */
  queryEvidence(query: MarketEvidenceQuery): Promise<MarketEvidenceQueryResult>
}

/**
 * The only provider that exists today. Reports every query as unavailable —
 * because it genuinely is: `marketEvidenceSources` (src/types/marketEvidence.ts)
 * is empty. This is the honest default the engine's current fixture-only
 * design is equivalent to, made explicit as a real implementation so a
 * future provider is a drop-in replacement, not a new code path.
 */
export const NoEvidenceProvider: MarketEvidenceProvider = {
  name: 'none (no external evidence source configured)',
  async queryEvidence(): Promise<MarketEvidenceQueryResult> {
    return { available: false, reason: 'provider_unavailable' }
  },
}
