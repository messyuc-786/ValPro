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
  | OnboardingScreenId
  | 'analysis'
  | 'result'
  | 'why'
  | 'gaps'
  | 'whatif'
  | 'share'

/** The linear step order for Next/Back. `creators` is a side excursion from
 * Welcome (reached and left via the history stack in AppContext), not a step. */
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
 */
const BACKDROPS: Record<ScreenId, string> = {
  welcome: '/backdrops/welcome.jpg',
  creators: '/backdrops/creators.jpg',
  role: '/backdrops/onboarding.jpg',
  domain: '/backdrops/onboarding.jpg',
  education: '/backdrops/onboarding.jpg',
  experience: '/backdrops/onboarding.jpg',
  skills: '/backdrops/onboarding.jpg',
  certifications: '/backdrops/onboarding.jpg',
  achievements: '/backdrops/onboarding.jpg',
  location: '/backdrops/onboarding.jpg',
  analysis: '/backdrops/analysis.jpg',
  result: '/backdrops/results.jpg',
  why: '/backdrops/insights.jpg',
  gaps: '/backdrops/insights.jpg',
  whatif: '/backdrops/whatif.jpg',
  share: '/backdrops/share.jpg',
}

export function backdropFor(screen: ScreenId): string {
  return BACKDROPS[screen]
}
