import { useState } from 'react'
import { useApp } from '../state/AppContext'
import { Button } from '../ui/Button'
import { IconDownload, IconLink, IconShare } from '../ui/icons'
import { Backdrop, FooterMark } from '../ui/Backdrop'
import { Wordmark } from '../ui/Logo'

function buildShareSummary(marketValue: number, score: number, topPercent: number, date: string): string {
  return [
    'VALPRO',
    'My Market Value',
    `₹${marketValue.toFixed(1)} LPA`,
    `Market Score ${score}/100`,
    `Top ${topPercent}%`,
    date,
    'Know Your Market Value.',
  ].join('\n')
}

function buildShareSvg(marketValue: number, score: number, topPercent: number, date: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="760" viewBox="0 0 600 760">
    <rect width="600" height="760" fill="#121210"/>
    <rect x="40" y="40" width="520" height="680" rx="8" fill="#faf9f5"/>
    <text x="80" y="110" font-family="Georgia, serif" font-size="26" font-weight="600" fill="#111111">ValPro</text>
    <text x="80" y="160" font-family="Arial, sans-serif" font-size="13" letter-spacing="2" fill="#77736b">MY MARKET VALUE</text>
    <text x="80" y="230" font-family="Georgia, serif" font-size="56" font-weight="600" fill="#111111">₹${marketValue.toFixed(1)} LPA</text>
    <text x="80" y="300" font-family="Arial, sans-serif" font-size="15" fill="#111111">Market Score ${score}/100</text>
    <text x="80" y="330" font-family="Arial, sans-serif" font-size="15" fill="#4f8bd1">Top ${topPercent}%</text>
    <text x="80" y="620" font-family="Arial, sans-serif" font-size="12" fill="#77736b">${date}</text>
    <text x="80" y="660" font-family="Georgia, serif" font-style="italic" font-size="16" fill="#111111">Know Your Market Value.</text>
    <text x="80" y="695" font-family="Arial, sans-serif" font-size="11" letter-spacing="1.5" fill="#9a9186">BHASAD.ORG</text>
  </svg>`
}

export function ShareResult() {
  const { result, goBack, restart } = useApp()
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  if (!result) return null

  const date = new Date(result.asOf).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const summary = buildShareSummary(result.marketValueLPA, result.score, result.percentileTopPercent, date)

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My ValPro Market Value', text: summary })
      } catch {
        // user cancelled — no-op
      }
    } else {
      await handleCopy()
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(summary)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 1800)
    } catch {
      // clipboard unavailable — silently ignore
    }
  }

  function handleDownload() {
    const svg = buildShareSvg(result!.marketValueLPA, result!.score, result!.percentileTopPercent, date)
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'valpro-market-value.svg'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <Backdrop image="/backdrops/share.jpg">
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4">
        <Wordmark />
        <h1 className="mt-6 font-display text-[26px] font-medium leading-snug">Share Your Result</h1>
        <p className="mt-1 text-[14px] text-[var(--color-muted)]">Let the world know your market value.</p>

        <div className="theme-light mt-7 rounded-[8px] border border-[var(--color-line-strong)] bg-[var(--color-surface)] p-6 text-[var(--color-text)]" data-testid="share-card">
          <p className="font-display text-[16px] font-semibold">ValPro</p>
          <p className="mt-4 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--color-muted)]">My Market Value</p>
          <p className="mt-1 font-display text-[32px] font-semibold tabular">₹{result.marketValueLPA.toFixed(1)} LPA</p>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[var(--color-muted)]">Market Score</p>
              <p className="font-mono text-[14px] font-semibold tabular">{result.score} / 100</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[var(--color-muted)]">&nbsp;</p>
              <p className="font-mono text-[14px] font-semibold text-[var(--color-accent-blue)] tabular">Top {result.percentileTopPercent}%</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-line)] pt-3">
            <span className="font-mono text-[11px] text-[var(--color-muted)] tabular">{date}</span>
            <span className="font-display text-[12px] italic text-[var(--color-muted)]">Know Your Market Value.</span>
          </div>
          <p className="mt-3 text-center text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">Bhasad.org</p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2.5">
          <button type="button" onClick={handleDownload} className="flex flex-col items-center gap-1.5 rounded-[3px] border border-[var(--color-line-strong)] py-3.5 text-[12px] font-medium">
            <IconDownload className="h-5 w-5" />
            Download
          </button>
          <button type="button" onClick={handleShare} className="flex flex-col items-center gap-1.5 rounded-[3px] border border-[var(--color-line-strong)] py-3.5 text-[12px] font-medium">
            <IconShare className="h-5 w-5" />
            Share
          </button>
          <button type="button" onClick={handleCopy} className="flex flex-col items-center gap-1.5 rounded-[3px] border border-[var(--color-line-strong)] py-3.5 text-[12px] font-medium">
            <IconLink className="h-5 w-5" />
            {copyState === 'copied' ? 'Copied' : 'Copy Link'}
          </button>
        </div>
        <p className="mt-3 text-[11px] text-[var(--color-muted)]">
          Download saves a share-card image. Copy Link copies a text summary — hosted links arrive with the ValPro backend.
        </p>
      </div>

      <div className="shrink-0 border-t border-[var(--color-line)] px-6 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[3px] border border-[var(--color-line-strong)]"
          >
            ←
          </button>
          <Button variant="outline" className="flex-1" onClick={restart}>
            Start a New Assessment
          </Button>
        </div>
        <div className="mt-2.5 flex justify-center">
          <FooterMark />
        </div>
      </div>
    </Backdrop>
  )
}
