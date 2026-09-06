import type { ReactNode } from 'react'
import { Backdrop, FooterMark } from '../../ui/Backdrop'
import { Wordmark } from '../../ui/Logo'
import { backdropFor } from '../../navigation/flow'
import { isSupabaseConfigured } from '../../auth/authService'

/**
 * Shared chrome for the auth screens (Sign In / Sign Up / Forgot Password).
 * These are NOT wired into the app's navigation graph yet (ScreenId,
 * SCREEN_ORDER, App.tsx) — there is no live Supabase project for them to
 * authenticate against, and shipping a reachable "Sign In" that always fails
 * would be worse than not shipping it. They're built, tested in isolation,
 * and ready to wire in once real credentials exist — see
 * docs/VALPRO_AUTH_ARCHITECTURE.md.
 */
export function AuthShell({ title, subtitle, children, onBack }: { title: string; subtitle: string; children?: ReactNode; onBack?: () => void }) {
  return (
    <Backdrop image={backdropFor('signIn')} variant="standard">
      <div className="flex h-full min-h-full flex-col px-6 pb-[calc(1.5rem_+_env(safe-area-inset-bottom))] pt-[calc(1.5rem_+_env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <Wordmark />
          {onBack && (
            <button type="button" onClick={onBack} aria-label="Go back" className="text-[13px] font-semibold text-[var(--color-accent-blue)]">
              Back
            </button>
          )}
        </div>

        <div className="mt-10 flex-1 overflow-y-auto">
          <h1 className="font-display text-[26px] font-medium leading-snug">{title}</h1>
          <p className="mt-2 text-[14px] text-[var(--color-muted)]">{subtitle}</p>

          {!isSupabaseConfigured && (
            <div className="mt-5 rounded-[4px] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-4 py-3 text-[13px] text-[var(--color-muted)]" role="status">
              Accounts aren't available yet — ValPro currently works fully without signing in. Check back soon.
            </div>
          )}

          <div className="mt-6">{children}</div>
        </div>

        <div className="mt-4 flex justify-center">
          <FooterMark />
        </div>
      </div>
    </Backdrop>
  )
}
