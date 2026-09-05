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
    localStorage.setItem('valpro.profile.v1', JSON.stringify({ role: 'working_professional', domain: 'education' }))
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
    localStorage.setItem('valpro.profile.v1', '{not json')
    expect(() => loadProfile()).not.toThrow()
    expect(loadProfile()).toBeNull()
  })

  it('clearPersistedState removes the stored profile', () => {
    saveProfile(createEmptyProfile())
    clearPersistedState()
    expect(loadProfile()).toBeNull()
  })
})
