export const ONBOARDING_SCREENS = [
  'role',
  'domain',
  'education',
  'experience',
  'skills',
  'certifications',
  'achievements',
  'location',
] as const

export type OnboardingScreenId = (typeof ONBOARDING_SCREENS)[number]

export type ScreenId =
  | 'welcome'
  | 'creators'
  | 'howItWorks'
  | 'faq'
  | OnboardingScreenId
  | 'analysis'
  | 'result'
  | 'why'
  | 'gaps'
  | 'whatif'
  | 'share'

/** The linear step order for Next/Back. `creators`, `howItWorks` and `faq`
 * are side excursions from Welcome (reached and left via the history stack
 * in AppContext), not steps. */
export const SCREEN_ORDER: ScreenId[] = [
  'welcome',
  ...ONBOARDING_SCREENS,
  'analysis',
  'result',
  'why',
  'gaps',
  'whatif',
  'share',
]

/** 1-indexed "N/8" progress shown during the onboarding intake — matches the reference screens. */
export function onboardingProgress(screen: ScreenId): { step: number; total: number } | null {
  const index = ONBOARDING_SCREENS.indexOf(screen as OnboardingScreenId)
  if (index === -1) return null
  return { step: index + 1, total: ONBOARDING_SCREENS.length }
}

export function nextScreen(current: ScreenId): ScreenId {
  const idx = SCREEN_ORDER.indexOf(current)
  return SCREEN_ORDER[Math.min(idx + 1, SCREEN_ORDER.length - 1)]
}

export function previousScreen(current: ScreenId): ScreenId {
  const idx = SCREEN_ORDER.indexOf(current)
  return SCREEN_ORDER[Math.max(idx - 1, 0)]
}

/**
 * Every screen renders on its own photographic backdrop (see src/ui/Backdrop.tsx)
 * per the ValPro UI Final Package's per-section backdrop system — one shared
 * image for the whole onboarding stretch, one each for the rest.
 *
 * Paths are relative (no leading slash) and resolved through Vite's BASE_URL
 * at use time — a hardcoded absolute path silently 404s once the app is
 * deployed under a subpath (e.g. GitHub Pages' /ValPro/).
 */
const BACKDROPS: Record<ScreenId, string> = {
  welcome: 'backdrops/welcome.jpg',
  creators: 'backdrops/creators.jpg',
  // Same visual family as About — these are the other two Welcome-nav side
  // excursions, not new sections of the reference package, so they reuse
  // its backdrop rather than introducing a new image.
  howItWorks: 'backdrops/creators.jpg',
  faq: 'backdrops/creators.jpg',
  role: 'backdrops/onboarding.jpg',
  domain: 'backdrops/onboarding.jpg',
  education: 'backdrops/onboarding.jpg',
  experience: 'backdrops/onboarding.jpg',
  skills: 'backdrops/onboarding.jpg',
  certifications: 'backdrops/onboarding.jpg',
  achievements: 'backdrops/onboarding.jpg',
  location: 'backdrops/onboarding.jpg',
  analysis: 'backdrops/analysis.jpg',
  result: 'backdrops/results.jpg',
  why: 'backdrops/insights.jpg',
  gaps: 'backdrops/insights.jpg',
  whatif: 'backdrops/whatif.jpg',
  share: 'backdrops/share.jpg',
}

export function backdropFor(screen: ScreenId): string {
  return `${import.meta.env.BASE_URL}${BACKDROPS[screen]}`
}
