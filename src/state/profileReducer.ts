import type {
  AchievementEntry,
  CertificationEntry,
  DomainId,
  EducationInfo,
  ExperienceInfo,
  LocationInfo,
  Profile,
  RoleType,
  SkillEntry,
} from '../types/profile'
import { createEmptyProfile } from '../types/profile'

export type ProfileAction =
  | { type: 'SET_ROLE'; role: RoleType }
  | { type: 'SET_DOMAIN'; domain: DomainId }
  | { type: 'SET_EDUCATION'; education: Partial<EducationInfo> }
  | { type: 'SET_EXPERIENCE'; experience: Partial<ExperienceInfo> }
  | { type: 'ADD_SKILL'; skill: Omit<SkillEntry, 'id'> }
  | { type: 'REMOVE_SKILL'; id: string }
  | { type: 'ADD_CERTIFICATION'; certification: Omit<CertificationEntry, 'id'> }
  | { type: 'REMOVE_CERTIFICATION'; id: string }
  | { type: 'ADD_ACHIEVEMENT'; achievement: Omit<AchievementEntry, 'id'> }
  | { type: 'REMOVE_ACHIEVEMENT'; id: string }
  | { type: 'SET_LOCATION'; location: Partial<LocationInfo> }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; profile: Profile }

let idCounter = 0
function nextId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${Date.now()}-${idCounter}`
}

export function profileReducer(state: Profile, action: ProfileAction): Profile {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.role }
    case 'SET_DOMAIN':
      return { ...state, domain: action.domain }
    case 'SET_EDUCATION':
      return { ...state, education: { ...state.education, ...action.education } }
    case 'SET_EXPERIENCE':
      return { ...state, experience: { ...state.experience, ...action.experience } }
    case 'ADD_SKILL':
      if (!action.skill.name.trim()) return state
      return { ...state, skills: [...state.skills, { ...action.skill, id: nextId('skill') }] }
    case 'REMOVE_SKILL':
      return { ...state, skills: state.skills.filter((s) => s.id !== action.id) }
    case 'ADD_CERTIFICATION':
      if (!action.certification.name.trim()) return state
      return { ...state, certifications: [...state.certifications, { ...action.certification, id: nextId('cert') }] }
    case 'REMOVE_CERTIFICATION':
      return { ...state, certifications: state.certifications.filter((c) => c.id !== action.id) }
    case 'ADD_ACHIEVEMENT':
      if (!action.achievement.title.trim()) return state
      return { ...state, achievements: [...state.achievements, { ...action.achievement, id: nextId('ach') }] }
    case 'REMOVE_ACHIEVEMENT':
      return { ...state, achievements: state.achievements.filter((a) => a.id !== action.id) }
    case 'SET_LOCATION':
      return { ...state, location: { ...state.location, ...action.location } }
    case 'RESET':
      return createEmptyProfile()
    case 'HYDRATE':
      return action.profile
    default:
      return state
  }
}
