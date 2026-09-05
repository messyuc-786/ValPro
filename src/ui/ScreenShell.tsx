import type { ReactNode } from 'react'
import { onboardingProgress, backdropFor } from '../navigation/flow'
import type { ScreenId } from '../navigation/flow'
import { useApp } from '../state/AppContext'
import { Backdrop, FooterMark } from './Backdrop'
import { Wordmark } from './Logo'
import { IconChevronLeft } from './icons'

interface ScreenShellProps {
  screen: ScreenId
  children: ReactNode
  footer?: ReactNode
  onBack?: () => void
  showBrandBar?: boolean
}

/**
 * Shared chrome for onboarding screens: brand row, "n/8" progress, the
 * photographic backdrop for this step, and a fixed footer slot for primary
 * actions — mirroring the phone-frame composition in the reference package.
 */
export function ScreenShell({ screen, children, footer, onBack, showBrandBar = true }: ScreenShellProps) {
  const { goBack } = useApp()
  const progress = onboardingProgress(screen)

  return (
    <Backdrop image={backdropFor(screen)}>
      {showBrandBar && (
        // pt adds the device's status-bar/notch inset on top of the normal
        // spacing (env() resolves to 0 on non-notched devices, so this is a
        // no-op there) — real phones, not just wide viewports.
        <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-[calc(1.5rem_+_env(safe-area-inset-top))]">
          <Wordmark />
          {progress && (
            <span className="font-mono text-[12px] text-[var(--color-muted)] tabular">
              {progress.step}/{progress.total}
            </span>
          )}
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-5 pb-6">{children}</div>
      {footer && (
        // pb adds the home-indicator inset — the fixed footer sits right at
        // the bottom edge, exactly where iPhone's gesture bar and Android's
        // nav pill live; without this the CTA crowds them uncomfortably.
        <div className="shrink-0 border-t border-[var(--color-line)] px-5 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] pt-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack ?? goBack}
                aria-label="Go back"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[3px] border border-[var(--color-line-strong)] text-[var(--color-text)]"
              >
                <IconChevronLeft className="h-5 w-5" />
              </button>
            )}
            <div className="flex-1">{footer}</div>
          </div>
          <div className="mt-2.5 flex justify-center">
            <FooterMark />
          </div>
        </div>
      )}
    </Backdrop>
  )
}
