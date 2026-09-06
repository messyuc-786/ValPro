import type { DomainPack } from '../types/domain'

/**
 * Education domain pack.
 * Deliberately different shape from Technology: achievements (student outcomes,
 * recognitions) and education signals outweigh location, and the LPA scale
 * reflects a genuinely different market rather than reusing tech's numbers.
 */
export const educationPack: DomainPack = {
  id: 'education',
  label: 'Education',
  shortLabel: 'Education',
  description: 'Teaching, Academics, and Administration roles.',
  category: 'Public, Health & Research',
  evidenceStatus: 'partial',

  benchmark: {
    dataSource: 'development_fixture',
  baseValueLPA: 3.6,
  perYearExperienceLPA: 0.5,
  experienceCapYears: 25,

  roleLevelMultipliers: { entry: 0.85, junior: 0.95, mid: 1, senior: 1.3, lead: 1.7 },

  instituteTierKeywords: {
    tier1: ['iit', 'iim', 'tiss', 'central university'],
    tier2: ['university', 'college of education', 'b.ed college'],
  },
  instituteTierMultipliers: { tier1: 1.15, tier2: 1.0, tier3: 0.9 },

  knownSkills: {
    'curriculum design': 1.0,
    'classroom management': 0.8,
    'edtech tools': 0.9,
    'assessment design': 0.9,
    counselling: 0.7,
  },
  defaultSkillDemand: 0.5,

  knownCertifications: {
    'b.ed': 0.6,
    'm.ed': 0.8,
    'ib certified': 1.2,
    'cambridge certified': 1.1,
    'net/set': 0.9,
  },
  defaultCertificationValue: 0.4,

  locationMultipliers: {
    'delhi ncr': 1.1,
    mumbai: 1.12,
    bangalore: 1.08,
    hyderabad: 1.0,
    pune: 1.0,
    chennai: 1.0,
    remote: 0.95,
    global: 1.3,
  },
  defaultLocationMultiplier: 0.98,

  benchmarkSpreadLPA: 18,

  weights: {
    education: 0.22,
    experience: 0.22,
    skills: 0.14,
    certifications: 0.14,
    achievements: 0.18,
    location: 0.1,
  },

  scenarioCatalog: [
    { id: 'ib_cert', label: 'Get IB Certified', kind: 'add_certification', payload: { certificationName: 'ib certified', certificationIssuer: 'International Baccalaureate' } },
    { id: 'move_metro', label: 'Move to a Metro School', kind: 'change_location', payload: { locationName: 'delhi ncr' } },
    { id: 'become_coordinator', label: 'Become Academic Coordinator', kind: 'promote_role_level', payload: {} },
    { id: 'add_edtech', label: 'Add EdTech Specialization', kind: 'add_skill', payload: { skillName: 'edtech tools', skillProficiency: 70 } },
  ],

  highDemandSkillLabel: 'High demand for your teaching specialization',
  },
}
