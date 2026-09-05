import { createEmptyProfile } from '../types/profile'
import type { Profile } from '../types/profile'

const PROFILE_KEY = 'valpro.profile.v1'

/**
 * Only the profile is persisted — never the current screen. The app always
 * opens at Welcome; resuming mid-flow from a stale screen after a fresh visit
 * was confusing (a returning visitor could land on step 4 of 8 with no idea
 * why). Profile answers already entered are still remembered, so going
 * through the flow again comes back pre-filled.
 *
 * All persistence is best-effort — a private window or disabled storage must
 * never break the app, it should simply not remember progress.
 */
export function saveProfile(profile: Profile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  } catch {
    // ignore — storage unavailable
  }
}

/**
 * Shallow-merges onto a fresh empty profile rather than trusting the stored
 * shape outright — a schema change or corrupted storage must degrade to
 * "some fields missing," never crash the app on a `profile.experience.band`
 * style read of a field that silently isn't there any more.
 */
export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Profile>
    if (!parsed || typeof parsed !== 'object') return null
    const empty = createEmptyProfile()
    return {
      ...empty,
      ...parsed,
      education: { ...empty.education, ...parsed.education },
      experience: { ...empty.experience, ...parsed.experience },
      location: { ...empty.location, ...parsed.location },
      skills: Array.isArray(parsed.skills) ? parsed.skills : empty.skills,
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : empty.certifications,
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : empty.achievements,
    }
  } catch {
    return null
  }
}

export function clearPersistedState(): void {
  try {
    localStorage.removeItem(PROFILE_KEY)
  } catch {
    // ignore
  }
}
