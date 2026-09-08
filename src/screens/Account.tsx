import { useEffect, useState } from 'react'
import { useApp } from '../state/AppContext'
import { Button } from '../ui/Button'
import { Backdrop, FooterMark } from '../ui/Backdrop'
import { Wordmark } from '../ui/Logo'
import { IconChevronLeft } from '../ui/icons'
import { backdropFor } from '../navigation/flow'
import { DOMAIN_OPTIONS, ROLE_TYPES } from '../types/profile'
import type { Confidence } from '../types/valuation'
import { formatCurrencyCompact } from '../types/currency'
import { ConfidenceBadge, MarketEvidenceBadge } from '../ui/resultDisplay'
import { deleteValuation, loadSavedValuations } from '../services/profileRepository'
import type { SavedValuationRow } from '../services/profileRepository'

type LoadState = 'loading' | 'loaded' | 'error'

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-[12.5px] text-[var(--color-muted)]">{label}</span>
      <span className="text-[13.5px] font-medium text-[var(--color-text)]">{value}</span>
    </div>
  )
}

/**
 * Account / Dashboard — surfaces the authenticated user's identity and
 * saved valuation history. Every data source here already existed
 * (session, profile, profileRepository's load/save/delete) — this screen
 * is presentation only, no new persistence logic.
 *
 * Unauthenticated access redirects to Sign In (never renders private data
 * for a frame) — the redirect lives in an effect, not during render,
 * since navigating during another component's render triggers a React
 * warning and is not guaranteed to apply before paint.
 */
export function Account() {
  const { session, profile, goTo, goBack, signOutUser, setViewingValuation } = useApp()
  const [valuations, setValuations] = useState<SavedValuationRow[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) {
      goTo('signIn')
      return
    }
    let active = true
    // No explicit setLoadState('loading') here: the initial state is
    // already 'loading' for the common case (mount with a session already
    // known). If `session.user.id` changes while this screen stays
    // mounted (rare — usually a full remount via navigation instead),
    // this briefly keeps showing the previous state until the new fetch
    // resolves rather than flashing back to loading synchronously inside
    // the effect.
    loadSavedValuations(session.user.id).then((result) => {
      if (!active) return
      if (result.ok) {
        setValuations(result.data)
        setLoadState('loaded')
      } else {
        setLoadState('error')
      }
    })
    return () => {
      active = false
    }
  }, [session, goTo])

  if (!session) return null

  const username = typeof session.user.user_metadata?.username === 'string' ? session.user.user_metadata.username : 'Account'
  const domainLabel = profile.domain ? DOMAIN_OPTIONS.find((d) => d.id === profile.domain)?.label : null
  const stageLabel = profile.role ? ROLE_TYPES.find((r) => r.id === profile.role)?.label : null

  async function handleDelete(id: string) {
    if (!session) return
    const result = await deleteValuation(session.user.id, id)
    if (result.ok) {
      setValuations((prev) => prev.filter((v) => v.id !== id))
      setConfirmDeleteId(null)
      setDeleteError(null)
    } else {
      setDeleteError("Couldn't delete that valuation. Try again.")
    }
  }

  function openValuation(row: SavedValuationRow) {
    setViewingValuation(row)
    goTo('valuationDetail')
  }

  return (
    <Backdrop image={backdropFor('account')}>
      <div className="flex-1 overflow-y-auto px-6 pb-4 pt-[calc(1.5rem_+_env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <Wordmark />
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-[3px] border border-[var(--color-line-strong)]"
          >
            <IconChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">Account</p>
        <h1 className="mt-2 font-display text-[26px] font-medium leading-snug">{username}</h1>
        <p className="mt-1 break-all text-[13px] text-[var(--color-muted)]">{session.user.email}</p>

        <div className="mt-5 flex flex-col divide-y divide-[var(--color-line)] rounded-[3px] border border-[var(--color-line)] bg-[var(--color-surface)] px-4">
          <ProfileRow label="Career Domain" value={domainLabel ?? 'Not set'} />
          <ProfileRow label="Role" value={profile.experience.currentRole || 'Not set'} />
          <ProfileRow label="Career Stage" value={stageLabel ?? 'Not set'} />
        </div>
        <Button variant="outline" className="mt-3 w-full" onClick={() => goTo('role')}>
          Edit Profile
        </Button>

        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">My Valuations</p>

        {loadState === 'loading' && <p className="mt-3 text-[13.5px] text-[var(--color-muted)]">Loading your saved valuations…</p>}

        {loadState === 'error' && (
          <p className="mt-3 text-[13.5px] text-[var(--color-negative)]">Couldn't load your valuations right now. Try again shortly.</p>
        )}

        {loadState === 'loaded' && valuations.length === 0 && (
          <div className="mt-3 flex flex-col items-start gap-3 rounded-[3px] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-5">
            <p className="text-[13.5px] leading-relaxed text-[var(--color-muted)]">
              No valuations yet. Complete your first ValPro assessment to see your market value here.
            </p>
            <Button variant="accent" onClick={() => goTo('role')}>
              Calculate My Value
            </Button>
          </div>
        )}

        {loadState === 'loaded' && valuations.length > 0 && (
          <div className="mt-3 flex flex-col gap-2.5">
            {valuations.map((v) => {
              const domainLbl = DOMAIN_OPTIONS.find((d) => d.id === v.domain_id)?.label ?? v.domain_id
              const currency = v.raw_result.marketEvidence !== 'insufficient' ? v.raw_result.currency : 'INR'
              return (
                <div key={v.id} className="rounded-[3px] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3.5" data-testid="valuation-card">
                  <button type="button" onClick={() => openValuation(v)} className="w-full text-left">
                    <p className="text-[14.5px] font-semibold text-[var(--color-text)]">{domainLbl}</p>
                    <p className="mt-0.5 font-mono text-[12px] text-[var(--color-muted)] tabular">
                      {new Date(v.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {v.market_value_lpa != null && (
                      <p className="mt-1.5 font-mono text-[15px] font-semibold text-[var(--color-text)] tabular">
                        {formatCurrencyCompact(v.market_value_lpa, currency)}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-center gap-2">
                      <MarketEvidenceBadge marketEvidence={v.market_evidence as 'supported' | 'partial'} />
                      {v.confidence && <ConfidenceBadge confidence={v.confidence as Confidence} />}
                    </div>
                  </button>

                  {confirmDeleteId === v.id ? (
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--color-line)] pt-3">
                      <span className="text-[12.5px] text-[var(--color-muted)]">Delete this valuation?</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-[3px] border border-[var(--color-line-strong)] px-3 py-1.5 text-[12px] font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(v.id)}
                          className="rounded-[3px] border border-[var(--color-negative)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-negative)]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(v.id)}
                      className="mt-3 w-full border-t border-[var(--color-line)] pt-3 text-left text-[12px] font-medium text-[var(--color-muted)] hover:text-[var(--color-negative)]"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )
            })}
            {deleteError && <p className="text-[12.5px] text-[var(--color-negative)]">{deleteError}</p>}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[var(--color-line)] px-6 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] pt-4">
        <Button variant="outline" className="w-full" onClick={() => signOutUser().then(() => goTo('welcome'))}>
          Sign Out
        </Button>
        <div className="mt-2.5 flex justify-center">
          <FooterMark />
        </div>
      </div>
    </Backdrop>
  )
}
