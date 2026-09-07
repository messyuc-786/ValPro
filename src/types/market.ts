import type { CurrencyCode } from './currency'

/**
 * The explicit, evidence-gated list of markets ValPro can actually value a
 * profile against — see docs/VALPRO_MARKET_DATA_ARCHITECTURE.md. A market
 * appears here only once real, sourced benchmark data backs it; the type
 * system supporting more currencies (src/types/currency.ts) does NOT mean a
 * market is "supported" — this list is the actual gate.
 *
 * `id` doubles as the value stored on `profile.location.targetMarket` and,
 * deliberately, as the human label — so a profile written before this file
 * existed (free-text "India") still round-trips correctly instead of a
 * cryptic code needing a migration.
 */
export interface SupportedMarket {
  id: string
  label: string
  currency: CurrencyCode
}

export const SUPPORTED_MARKETS: SupportedMarket[] = [{ id: 'India', label: 'India', currency: 'INR' }]

/** Selectable when a user's actual target market isn't in the list above —
 * an honest "not covered" choice instead of forcing them to pick India (or
 * leaving free text ValPro would otherwise have to guess at). */
export const UNLISTED_MARKET_ID = 'OTHER'

export function isSupportedMarket(marketId: string): boolean {
  return SUPPORTED_MARKETS.some((m) => m.id === marketId)
}

export function marketLabel(marketId: string): string {
  if (marketId === UNLISTED_MARKET_ID) return 'the market you selected'
  return SUPPORTED_MARKETS.find((m) => m.id === marketId)?.label ?? marketId
}
