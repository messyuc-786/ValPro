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
  | OnboardingScreenId
  | 'analysis'
  | 'result'
  | 'why'
  | 'gaps'
  | 'whatif'
  | 'share'

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

/** Screens rendered in the dark "analysis / result" visual mode. */
export const DARK_MODE_SCREENS: ScreenId[] = ['analysis', 'result', 'why', 'gaps', 'whatif', 'share']

export function isDarkScreen(screen: ScreenId): boolean {
  return DARK_MODE_SCREENS.includes(screen)
}
