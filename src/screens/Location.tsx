import { useApp } from '../state/AppContext'
import { ScreenShell } from '../ui/ScreenShell'
import { Button } from '../ui/Button'
import { FieldGroup, FieldLabel, SelectField } from '../ui/fields'
import { LOCATIONS } from '../types/profile'
import { SUPPORTED_MARKETS, UNLISTED_MARKET_ID } from '../types/market'

export function Location() {
  const { profile, dispatch, goNext, goBack } = useApp()
  const { location } = profile
  const canContinue = Boolean(location.current)

  return (
    <ScreenShell
      screen="location"
      onBack={goBack}
      footer={
        <Button className="w-full" disabled={!canContinue} onClick={goNext}>
          <span className="flex w-full items-center justify-between">
            Analyze My Value
            <span aria-hidden>→</span>
          </span>
        </Button>
      }
    >
      <h1 className="text-[26px] font-semibold leading-tight">Your Location</h1>
      <p className="mt-2 text-[14px] text-[var(--color-muted)]">Select your current and target location.</p>

      <div className="mt-6 flex flex-col gap-4">
        <FieldGroup>
          <FieldLabel htmlFor="currentLocation">Current Location</FieldLabel>
          <SelectField
            id="currentLocation"
            value={location.current}
            onChange={(e) => dispatch({ type: 'SET_LOCATION', location: { current: e.target.value as never } })}
          >
            <option value="" disabled>
              Select location
            </option>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </SelectField>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="targetMarket">Target Market (for opportunities)</FieldLabel>
          <SelectField
            id="targetMarket"
            value={location.targetMarket}
            onChange={(e) => dispatch({ type: 'SET_LOCATION', location: { targetMarket: e.target.value } })}
          >
            <option value="">Same as current location</option>
            {SUPPORTED_MARKETS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
            <option value={UNLISTED_MARKET_ID}>Other / Not Listed</option>
          </SelectField>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="targetCity">Target City</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {LOCATIONS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => dispatch({ type: 'SET_LOCATION', location: { targetCity: l } })}
                className={`rounded-[3px] border px-3.5 py-2 text-[13px] font-medium transition-colors ${
                  location.targetCity === l
                    ? 'border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)]'
                    : 'border-[var(--color-line-strong)] text-[var(--color-text)]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </FieldGroup>
      </div>
    </ScreenShell>
  )
}
