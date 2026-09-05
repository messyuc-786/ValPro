import { describe, expect, it } from 'vitest'
import { createEmptyProfile } from '../types/profile'
import { profileReducer } from './profileReducer'

describe('profileReducer', () => {
  it('sets role', () => {
    const state = profileReducer(createEmptyProfile(), { type: 'SET_ROLE', role: 'fresher' })
    expect(state.role).toBe('fresher')
  })

  it('sets domain', () => {
    const state = profileReducer(createEmptyProfile(), { type: 'SET_DOMAIN', domain: 'banking' })
    expect(state.domain).toBe('banking')
  })

  it('merges partial education updates without dropping other fields', () => {
    let state = profileReducer(createEmptyProfile(), { type: 'SET_EDUCATION', education: { institute: 'IIT Delhi' } })
    state = profileReducer(state, { type: 'SET_EDUCATION', education: { marks: 8.5 } })
    expect(state.education.institute).toBe('IIT Delhi')
    expect(state.education.marks).toBe(8.5)
  })

  it('merges partial experience updates', () => {
    const state = profileReducer(createEmptyProfile(), { type: 'SET_EXPERIENCE', experience: { currentRole: 'Analyst' } })
    expect(state.experience.currentRole).toBe('Analyst')
  })

  it('adds and removes a skill', () => {
    let state = profileReducer(createEmptyProfile(), { type: 'ADD_SKILL', skill: { name: 'React', proficiency: 80 } })
    expect(state.skills).toHaveLength(1)
    const id = state.skills[0].id
    state = profileReducer(state, { type: 'REMOVE_SKILL', id })
    expect(state.skills).toHaveLength(0)
  })

  it('ignores a skill with a blank name', () => {
    const state = profileReducer(createEmptyProfile(), { type: 'ADD_SKILL', skill: { name: '   ', proficiency: 50 } })
    expect(state.skills).toHaveLength(0)
  })

  it('adds and removes a certification', () => {
    let state = profileReducer(createEmptyProfile(), { type: 'ADD_CERTIFICATION', certification: { name: 'AWS SA', issuer: 'AWS', year: 2024 } })
    expect(state.certifications).toHaveLength(1)
    state = profileReducer(state, { type: 'REMOVE_CERTIFICATION', id: state.certifications[0].id })
    expect(state.certifications).toHaveLength(0)
  })

  it('adds and removes an achievement', () => {
    let state = profileReducer(createEmptyProfile(), { type: 'ADD_ACHIEVEMENT', achievement: { title: 'Led a team of 6', category: 'leadership', year: 2023 } })
    expect(state.achievements).toHaveLength(1)
    state = profileReducer(state, { type: 'REMOVE_ACHIEVEMENT', id: state.achievements[0].id })
    expect(state.achievements).toHaveLength(0)
  })

  it('sets location fields', () => {
    const state = profileReducer(createEmptyProfile(), { type: 'SET_LOCATION', location: { current: 'Bangalore' } })
    expect(state.location.current).toBe('Bangalore')
  })

  it('resets to an empty profile', () => {
    let state = profileReducer(createEmptyProfile(), { type: 'SET_ROLE', role: 'fresher' })
    state = profileReducer(state, { type: 'RESET' })
    expect(state.role).toBeNull()
  })

  it('hydrates from a persisted profile', () => {
    const persisted = { ...createEmptyProfile(), role: 'job_seeker' as const }
    const state = profileReducer(createEmptyProfile(), { type: 'HYDRATE', profile: persisted })
    expect(state.role).toBe('job_seeker')
  })
})
