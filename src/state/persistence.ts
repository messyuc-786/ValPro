import type { Profile } from '../types/profile'
import type { ScreenId } from '../navigation/flow'

const PROFILE_KEY = 'valpro.profile.v1'
const SCREEN_KEY = 'valpro.screen.v1'

/** All persistence is best-effort — a private window or disabled storage must
 * never break the app, it should simply not remember progress. */
export function saveProfile(profile: Profile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  } catch {
    // ignore — storage unavailable
  }
}

export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? (JSON.parse(raw) as Profile) : null
  } catch {
    return null
  }
}

export function saveScreen(screen: ScreenId): void {
  try {
    localStorage.setItem(SCREEN_KEY, screen)
  } catch {
    // ignore
  }
}

export function loadScreen(): ScreenId | null {
  try {
    return (localStorage.getItem(SCREEN_KEY) as ScreenId) || null
  } catch {
    return null
  }
}

export function clearPersistedState(): void {
  try {
    localStorage.removeItem(PROFILE_KEY)
    localStorage.removeItem(SCREEN_KEY)
  } catch {
    // ignore
  }
}
