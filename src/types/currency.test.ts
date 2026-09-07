import { describe, expect, it } from 'vitest'
import { currencySymbol, currencyUnitLabel, formatCurrencyAmount, formatCurrencyCompact } from './currency'
import type { CurrencyCode } from './currency'

/** Regression tests for the currency/valuation bug investigation
 * (docs/VALPRO_CURRENCY_VALUATION_FIX_REPORT.md). These pin down the
 * formatting contract directly, independent of the valuation engine —
 * see valuationEngine.test.ts for the end-to-end "India profile → INR
 * result" scenarios. */
describe('currency formatting', () => {
  it('formats an INR amount with the ₹ symbol and LPA unit, never USD/$', () => {
    const formatted = formatCurrencyAmount(14.5, 'INR')
    expect(formatted).toBe('₹14.5 LPA')
    expect(formatted).not.toContain('$')
    expect(formatted).not.toMatch(/USD/i)
  })

  it('rounds to exactly one decimal place, never showing false precision', () => {
    expect(formatCurrencyAmount(14.5678, 'INR')).toBe('₹14.6 LPA')
    expect(formatCurrencyCompact(9.999, 'INR')).toBe('₹10.0L')
  })

  it('compact and full formats represent the same underlying value in the same unit (Lakhs), not a converted one', () => {
    // formatCurrencyCompact's "L" and formatCurrencyAmount's "LPA" both mean
    // Lakhs Per Annum for INR — this asserts they never diverge by rendering
    // a value as though the compact form were a different unit (e.g. crores,
    // thousands) than the full form.
    const value = 14.5
    const full = formatCurrencyAmount(value, 'INR')
    const compact = formatCurrencyCompact(value, 'INR')
    expect(full).toContain(value.toFixed(1))
    expect(compact).toContain(value.toFixed(1))
  })

  it('exposes the currency symbol and unit label separately for callers that need to compose their own layout', () => {
    expect(currencySymbol('INR')).toBe('₹')
    expect(currencyUnitLabel('INR')).toBe('LPA')
  })

  it('handles an unrecognized/missing currency safely — no crash, no fabricated symbol, no silent "undefined"', () => {
    // A value that TypeScript would reject at compile time can still arrive
    // at runtime (corrupted storage, a future schema change, a stale cached
    // result) — this must degrade to an honest marker, not throw and not
    // print "undefined₹NaN".
    const badCurrency = 'XYZ' as CurrencyCode
    expect(() => formatCurrencyAmount(14.5, badCurrency)).not.toThrow()
    expect(() => formatCurrencyCompact(14.5, badCurrency)).not.toThrow()
    expect(formatCurrencyAmount(14.5, badCurrency)).not.toContain('undefined')
    expect(formatCurrencyAmount(14.5, badCurrency)).not.toContain('$')
    expect(currencySymbol(badCurrency)).not.toBe('$')
  })
})
