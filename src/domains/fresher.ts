import type { DomainPack } from '../types/domain'

/**
 * Fresher / Student domain pack.
 * Per the fresher-logic requirement, a fresher is never valued at zero: education,
 * institute tier and demonstrated skill/certification signal carry the weight that
 * experience would carry elsewhere, and the experience cap is intentionally tiny.
 */
export const fresherPack: DomainPack = {
  id: 'fresher',
  label: 'Fresher / Student',
  shortLabel: 'Fresher',
  description: 'Students, graduates, and entry-level candidates.',

  baseValueLPA: 3.2,
  perYearExperienceLPA: 0.9,
  experienceCapYears: 2,

  roleLevelMultipliers: { entry: 1, junior: 1.05, mid: 1.1, senior: 1.2, lead: 1.3 },

  instituteTierKeywords: {
    tier1: ['iit', 'indian institute of technology', 'bits pilani', 'iisc', 'nit', 'iiit', 'iim'],
    tier2: ['university', 'institute of technology', 'college of engineering'],
  },
  instituteTierMultipliers: { tier1: 1.32, tier2: 1.0, tier3: 0.85 },

  knownSkills: {
    java: 0.9,
    python: 1.0,
    sql: 0.6,
    'data structures': 1.0,
    react: 0.8,
    'internship experience': 1.1,
    'project portfolio': 0.9,
  },
  defaultSkillDemand: 0.45,

  knownCertifications: {
    'aws cloud practitioner': 0.6,
    'google data analytics': 0.5,
    nptel: 0.4,
  },
  defaultCertificationValue: 0.35,

  locationMultipliers: {
    bangalore: 1.15,
    'delhi ncr': 1.1,
    mumbai: 1.12,
    hyderabad: 1.08,
    pune: 1.06,
    chennai: 1.03,
    remote: 1.0,
    global: 1.25,
  },
  defaultLocationMultiplier: 1.0,

  benchmarkSpreadLPA: 10,

  weights: {
    education: 0.3,
    experience: 0.1,
    skills: 0.22,
    certifications: 0.14,
    achievements: 0.14,
    location: 0.1,
  },

  scenarioCatalog: [
    { id: 'cloud_cert', label: 'Get AWS Cloud Practitioner', kind: 'add_certification', payload: { certificationName: 'aws cloud practitioner', certificationIssuer: 'Amazon Web Services' } },
    { id: 'move_bangalore', label: 'Target Bangalore Companies', kind: 'change_location', payload: { locationName: 'bangalore' } },
    { id: 'add_portfolio', label: 'Build a Portfolio Project', kind: 'add_skill', payload: { skillName: 'project portfolio', skillProficiency: 70 } },
    { id: 'add_ds', label: 'Learn Data Structures & Algorithms', kind: 'add_skill', payload: { skillName: 'data structures', skillProficiency: 75 } },
  ],

  highDemandSkillLabel: 'High demand for your skill set among entry-level hiring',
}
