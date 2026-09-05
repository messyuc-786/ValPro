import type { DomainPack } from '../types/domain'

/**
 * Banking & Finance domain pack.
 * Certifications (CFA/FRM) and location carry more relative weight here than in
 * Technology — regulatory and city-of-listing effects are stronger in this market.
 */
export const bankingPack: DomainPack = {
  id: 'banking',
  label: 'Banking & Finance',
  shortLabel: 'Banking',
  description: 'Banking, Investment, FinTech, and related roles.',

  baseValueLPA: 5.8,
  perYearExperienceLPA: 1.15,
  experienceCapYears: 18,

  roleLevelMultipliers: { entry: 0.82, junior: 0.95, mid: 1, senior: 1.45, lead: 2.0 },

  instituteTierKeywords: {
    tier1: ['iim', 'indian institute of management', 'nmims', 'xlri', 'iit'],
    tier2: ['university', 'college of commerce', 'institute of finance'],
  },
  instituteTierMultipliers: { tier1: 1.25, tier2: 1.0, tier3: 0.87 },

  knownSkills: {
    'financial modeling': 1.2,
    'equity research': 1.3,
    'risk management': 1.2,
    'credit analysis': 1.0,
    sql: 0.6,
    'bloomberg terminal': 1.1,
    valuation: 1.1,
    'portfolio management': 1.2,
  },
  defaultSkillDemand: 0.55,

  knownCertifications: {
    'cfa level i': 1.0,
    'cfa level ii': 1.6,
    'cfa level iii': 2.2,
    frm: 1.5,
    nism: 0.6,
  },
  defaultCertificationValue: 0.45,

  locationMultipliers: {
    mumbai: 1.25,
    'delhi ncr': 1.15,
    bangalore: 1.05,
    hyderabad: 1.0,
    pune: 1.0,
    chennai: 1.0,
    remote: 0.95,
    global: 1.4,
  },
  defaultLocationMultiplier: 0.98,

  benchmarkSpreadLPA: 36,

  weights: {
    education: 0.15,
    experience: 0.28,
    skills: 0.18,
    certifications: 0.17,
    achievements: 0.12,
    location: 0.1,
  },

  scenarioCatalog: [
    { id: 'cfa2', label: 'Clear CFA Level II', kind: 'add_certification', payload: { certificationName: 'cfa level ii', certificationIssuer: 'CFA Institute' } },
    { id: 'move_mumbai', label: 'Move to Mumbai', kind: 'change_location', payload: { locationName: 'mumbai' } },
    { id: 'become_lead', label: 'Become a Team Lead', kind: 'promote_role_level', payload: {} },
    { id: 'add_risk', label: 'Add Risk Management Specialization', kind: 'add_skill', payload: { skillName: 'risk management', skillProficiency: 70 } },
  ],

  highDemandSkillLabel: 'High demand for your skill set',
}
