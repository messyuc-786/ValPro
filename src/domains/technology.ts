import type { DomainPack } from '../types/domain'

/**
 * Technology domain pack.
 * Weighting leans on experience and skill/certification depth over pedigree —
 * a strong AWS + system-design profile can outweigh a middling institute tier.
 *
 * benchmark below is hand-authored demo data, not verified market research —
 * see docs/VALPRO_CURRENT_BASELINE.md.
 */
export const technologyPack: DomainPack = {
  id: 'technology',
  label: 'Technology / IT',
  shortLabel: 'Tech',
  description: 'Software, Data, AI, Cloud, and related engineering roles.',
  category: 'Technology & Data',
  evidenceStatus: 'partial',

  benchmark: {
    dataSource: 'development_fixture',
    baseValueLPA: 6.5,
    perYearExperienceLPA: 1.4,
    experienceCapYears: 15,

    roleLevelMultipliers: { entry: 0.8, junior: 0.95, mid: 1, senior: 1.5, lead: 2.1 },

    instituteTierKeywords: {
      tier1: ['iit', 'indian institute of technology', 'bits pilani', 'iisc', 'nit', 'iiit'],
      tier2: ['university', 'institute of technology', 'college of engineering'],
    },
    instituteTierMultipliers: { tier1: 1.22, tier2: 1.0, tier3: 0.88 },

    knownSkills: {
      java: 1.1,
      'spring boot': 1.0,
      aws: 1.3,
      azure: 1.2,
      gcp: 1.2,
      sql: 0.7,
      'system design': 1.4,
      react: 1.1,
      python: 1.2,
      'machine learning': 1.6,
      kubernetes: 1.3,
      'node.js': 1.1,
      typescript: 1.0,
      'data structures': 0.9,
    },
    defaultSkillDemand: 0.6,

    knownCertifications: {
      'aws solutions architect': 1.8,
      'aws certified developer': 1.2,
      'aws cloud practitioner': 0.6,
      'google professional data engineer': 1.6,
      'azure administrator': 1.1,
      pmp: 1.0,
      ckad: 1.0,
    },
    defaultCertificationValue: 0.5,

    locationMultipliers: {
      bangalore: 1.22,
      'delhi ncr': 1.15,
      mumbai: 1.18,
      hyderabad: 1.12,
      pune: 1.1,
      chennai: 1.05,
      remote: 1.0,
      global: 1.35,
    },
    defaultLocationMultiplier: 1.0,

    benchmarkSpreadLPA: 42,

    weights: {
      education: 0.12,
      experience: 0.3,
      skills: 0.22,
      certifications: 0.12,
      achievements: 0.12,
      location: 0.12,
    },

    scenarioCatalog: [
      { id: 'aws_cert', label: 'Get AWS Certification', kind: 'add_certification', payload: { certificationName: 'aws solutions architect', certificationIssuer: 'Amazon Web Services' } },
      { id: 'move_bangalore', label: 'Move to Bangalore', kind: 'change_location', payload: { locationName: 'bangalore' } },
      { id: 'become_em', label: 'Become Engineering Manager', kind: 'promote_role_level', payload: {} },
      { id: 'add_ai', label: 'Add AI Specialization', kind: 'add_skill', payload: { skillName: 'machine learning', skillProficiency: 70 } },
    ],

    highDemandSkillLabel: 'High demand for your skill set',
  },
}
