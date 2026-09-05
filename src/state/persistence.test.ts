import { beforeEach, describe, expect, it } from 'vitest'
import { clearPersistedState, loadProfile, saveProfile } from './persistence'
import { createEmptyProfile } from '../types/profile'

describe('persistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when nothing is stored', () => {
    expect(loadProfile()).toBeNull()
  })

  it('round-trips a full profile', () => {
    const profile = { ...createEmptyProfile(), role: 'fresher' as const, domain: 'technology' as const }
    saveProfile(profile)
    expect(loadProfile()).toEqual(profile)
  })

  it('degrades gracefully instead of crashing on a partial/old-schema profile', () => {
    localStorage.setItem('valpro.profile.v2', JSON.stringify({ role: 'working_professional', domain: 'education' }))
    const loaded = loadProfile()
    expect(loaded).not.toBeNull()
    // The fields a real screen reads (e.g. experience.band via experienceYears) must exist.
    expect(loaded!.experience.band).toBe('')
    expect(loaded!.education.marks).toBe('')
    expect(loaded!.location.current).toBe('')
    expect(loaded!.skills).toEqual([])
    expect(loaded!.role).toBe('working_professional')
    expect(loaded!.domain).toBe('education')
  })

  it('returns null for corrupted (non-JSON) storage rather than throwing', () => {
    localStorage.setItem('valpro.profile.v2', '{not json')
    expect(() => loadProfile()).not.toThrow()
    expect(loadProfile()).toBeNull()
  })

  it('clearPersistedState removes the stored profile', () => {
    saveProfile(createEmptyProfile())
    clearPersistedState()
    expect(loadProfile()).toBeNull()
  })

  it('ignores stale data left under old keys from a previous build (v1 profile, old screen key)', () => {
    localStorage.setItem('valpro.profile.v1', JSON.stringify({ role: 'job_seeker', domain: 'banking' }))
    localStorage.setItem('valpro.screen.v1', 'domain')
    // Nothing under the current key, so a returning visitor with only old-build
    // data should look exactly like a first-time visitor — no leftover role/domain.
    const loaded = loadProfile()
    expect(loaded).toBeNull()
  })

  it('cleans up the old keys once loadProfile has run, rather than leaving them to accumulate', () => {
    localStorage.setItem('valpro.profile.v1', JSON.stringify({ role: 'job_seeker' }))
    localStorage.setItem('valpro.screen.v1', 'domain')
    loadProfile()
    expect(localStorage.getItem('valpro.profile.v1')).toBeNull()
    expect(localStorage.getItem('valpro.screen.v1')).toBeNull()
  })
})
