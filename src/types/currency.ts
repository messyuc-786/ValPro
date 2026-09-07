/**
 * Explicit currency/market model — see docs/VALPRO_CURRENCY_VALUATION_FIX_REPORT.md
 * for the investigation that led here. Every number the valuation engine
 * produces must carry an explicit currency and unit; nothing renders a bare
 * number and assumes what it means.
 *
 * Only 'INR' exists today because ValPro's only calibrated benchmark data
 * (technology/banking/education/fresher — all development fixtures, see
 * docs/VALPRO_CURRENT_BASELINE.md) is Indian-market data. Adding a second
 * market means adding its code here AND giving it real, sourced benchmark
 * data (src/types/marketEvidence.ts) — never adding a currency code with no
 * evidence behind it.
 */
export type CurrencyCode = 'INR'

/** The market a CurrencyCode is valid for — kept alongside the code itself
 * so a result can say "India / INR" rather than just "INR" (which alone
 * doesn't rule out, say, a hypothetical future INR-adjacent market). */
export const CURRENCY_MARKET: Record<CurrencyCode, string> = {
  INR: 'India',
}

const CURRENCY_SYMBOL: Record<CurrencyCode, string> = {
  INR: '₹',
}

/** India's compensation is conventionally quoted in Lakhs Per Annum, not a
 * generic "per year" — this label is currency-specific, not a universal
 * unit, which is exactly why it lives here instead of being hardcoded at
 * every render site. A future currency with no natural "LPA" equivalent
 * would define its own label here (e.g. 'USD': '/ year'). */
const CURRENCY_UNIT_LABEL: Record<CurrencyCode, string> = {
  INR: 'LPA',
}

/** The compact per-number suffix used inline (e.g. "₹14.5L" for a range
 * endpoint) — India's "L" for Lakh. Also currency-specific, for the same
 * reason as CURRENCY_UNIT_LABEL above. */
const CURRENCY_COMPACT_SUFFIX: Record<CurrencyCode, string> = {
  INR: 'L',
}

/** `CurrencyCode` only has one member today, so TypeScript rejects anything
 * else at compile time — but a value that reaches here at runtime (bad
 * Supabase row, stale cached result, a future migration bug) isn't
 * guaranteed to actually be a key in these maps. Rather than let a lookup
 * miss surface as a raw "undefined" in the UI, every formatter below falls
 * back to this explicit, honest marker instead of guessing a symbol. */
const UNKNOWN_CURRENCY_MARKER = '—'

function isKnownCurrency(currency: string): currency is CurrencyCode {
  return currency in CURRENCY_SYMBOL
}

export function currencySymbol(currency: CurrencyCode): string {
  if (!isKnownCurrency(currency)) return UNKNOWN_CURRENCY_MARKER
  return CURRENCY_SYMBOL[currency]
}

export function currencyUnitLabel(currency: CurrencyCode): string {
  if (!isKnownCurrency(currency)) return UNKNOWN_CURRENCY_MARKER
  return CURRENCY_UNIT_LABEL[currency]
}

/** "₹14.5 LPA" — the one place that assembles a currency amount for
 * display, so every screen renders the same shape for the same data
 * instead of five hand-written template strings that could drift apart
 * (which is exactly how a currency mismatch bug hides — see the fix report). */
export function formatCurrencyAmount(value: number, currency: CurrencyCode): string {
  if (!isKnownCurrency(currency)) return `${UNKNOWN_CURRENCY_MARKER} ${value.toFixed(1)}`
  return `${currencySymbol(currency)}${value.toFixed(1)} ${currencyUnitLabel(currency)}`
}

/** "₹14.5L" — the compact form used inline in ranges/deltas, without
 * repeating the unit label on every number in a row. */
export function formatCurrencyCompact(value: number, currency: CurrencyCode): string {
  if (!isKnownCurrency(currency)) return `${UNKNOWN_CURRENCY_MARKER}${value.toFixed(1)}`
  return `${currencySymbol(currency)}${value.toFixed(1)}${CURRENCY_COMPACT_SUFFIX[currency]}`
}
