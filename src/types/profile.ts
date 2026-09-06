/**
 * Profile types — the structured signals ValPro collects about a person.
 * These are the inputs to the Universal Valuation Engine (see src/engine).
 */

export type RoleType =
  | 'student'
  | 'fresher'
  | 'working_professional'
  | 'job_seeker'
  | 'career_switcher'

export const ROLE_TYPES: { id: RoleType; label: string; detail: string }[] = [
  { id: 'student', label: 'Student', detail: 'Currently studying' },
  { id: 'fresher', label: 'Fresher', detail: 'Recent graduate, no full-time experience' },
  { id: 'working_professional', label: 'Working Professional', detail: 'Currently employed' },
  { id: 'job_seeker', label: 'Job Seeker', detail: 'Looking for new opportunities' },
  { id: 'career_switcher', label: 'Career Switcher', detail: 'Transitioning to a new field' },
]

export type DomainId =
  | 'technology'
  | 'banking'
  | 'education'
  | 'fresher'
  | 'healthcare'
  | 'sales'
  | 'marketing'
  | 'hr'
  | 'operations'
  | 'legal'
  | 'consulting'
  | 'accounting'
  | 'manufacturing'
  | 'engineering'
  | 'architecture'
  | 'media'
  | 'hospitality'
  | 'retail'
  | 'logistics'
  | 'real_estate'
  | 'government'
  | 'research'
  | 'pharma'
  | 'telecom'
  | 'data_analytics'
  | 'product_management'
  | 'project_management'
  | 'customer_success'
  | 'skilled_trades'
  | 'entrepreneur'
  | 'other'

/**
 * Every professional domain the app lets a user select. Four of these
 * (technology, banking, education, fresher) have a hand-authored demo
 * benchmark model behind them (see src/domains/*.ts) — the rest are fully
 * selectable but have no calibration yet, so Result shows an honest
 * "insufficient market evidence" state for them rather than a fabricated
 * number (see DomainPack.benchmarkStatus and the valuation engine).
 */
export const DOMAIN_OPTIONS: { id: DomainId; label: string; detail: string }[] = [
  { id: 'technology', label: 'Technology / IT', detail: 'Software, Data, AI, Cloud, etc.' },
  { id: 'banking', label: 'Banking & Finance', detail: 'Banking, Investment, FinTech, etc.' },
  { id: 'education', label: 'Education', detail: 'Teaching, Academics, Administration' },
  { id: 'healthcare', label: 'Healthcare', detail: 'Clinical, Nursing, Hospital Administration' },
  { id: 'sales', label: 'Sales', detail: 'B2B, B2C, Enterprise, Field Sales' },
  { id: 'marketing', label: 'Marketing', detail: 'Brand, Digital, Growth, Content' },
  { id: 'hr', label: 'Human Resources', detail: 'Talent, People Ops, L&D' },
  { id: 'operations', label: 'Operations', detail: 'Business & Process Operations' },
  { id: 'legal', label: 'Legal', detail: 'Corporate Law, Compliance, Litigation' },
  { id: 'consulting', label: 'Consulting', detail: 'Strategy, Management, Advisory' },
  { id: 'accounting', label: 'Accounting / Audit', detail: 'Accounting, Audit, Taxation' },
  { id: 'manufacturing', label: 'Manufacturing', detail: 'Plant Operations, Production, Quality' },
  { id: 'engineering', label: 'Engineering', detail: 'Core / Non-IT Engineering Disciplines' },
  { id: 'architecture', label: 'Architecture / Design', detail: 'Architecture, Interior, Urban Design' },
  { id: 'media', label: 'Media / Content', detail: 'Journalism, Film, Content Creation' },
  { id: 'hospitality', label: 'Hospitality / Travel', detail: 'Hotels, Travel, Tourism' },
  { id: 'retail', label: 'Retail', detail: 'Retail Operations & Management' },
  { id: 'logistics', label: 'Logistics / Supply Chain', detail: 'Supply Chain, Warehousing, Freight' },
  { id: 'real_estate', label: 'Real Estate', detail: 'Real Estate Sales, Development, PropTech' },
  { id: 'government', label: 'Government / Public Sector', detail: 'Civil Services, Public Administration' },
  { id: 'research', label: 'Research / Science', detail: 'R&D, Academic & Industrial Research' },
  { id: 'pharma', label: 'Pharmaceuticals', detail: 'Pharma R&D, Manufacturing, Regulatory' },
  { id: 'telecom', label: 'Telecom', detail: 'Telecommunications & Networks' },
  { id: 'data_analytics', label: 'Data / Analytics', detail: 'Data Science, BI, Analytics' },
  { id: 'product_management', label: 'Product Management', detail: 'Product Strategy & Delivery' },
  { id: 'project_management', label: 'Project Management', detail: 'Program & Project Delivery' },
  { id: 'customer_success', label: 'Customer Success / Support', detail: 'CS, Support, Account Management' },
  { id: 'skilled_trades', label: 'Skilled Trades', detail: 'Electrical, Plumbing, Technical Trades' },
  { id: 'entrepreneur', label: 'Entrepreneur / Founder', detail: 'Founders & Self-Employed' },
  { id: 'fresher', label: 'Fresher / Student', detail: 'Students, Graduates, Entry Level' },
  { id: 'other', label: 'Other', detail: "Doesn't fit the categories above" },
]

export type RoleLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'lead'

export const QUALIFICATIONS = [
  "High School",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  'MBA',
  'Doctorate (PhD)',
] as const
export type Qualification = (typeof QUALIFICATIONS)[number]

export interface EducationInfo {
  qualification: Qualification | ''
  specialization: string
  institute: string
  graduationYear: number | ''
  marks: number | '' // out of 10 (CGPA)
}

export const EXPERIENCE_BANDS = [
  { id: 'lt1', label: 'Less than 1 year', years: 0.5 },
  { id: '1-3', label: '1 - 3 years', years: 2 },
  { id: '3-5', label: '3 - 5 years', years: 4 },
  { id: '5-8', label: '5 - 8 years', years: 6.5 },
  { id: '8-12', label: '8 - 12 years', years: 10 },
  { id: '12plus', label: '12+ years', years: 14 },
] as const
export type ExperienceBandId = (typeof EXPERIENCE_BANDS)[number]['id']

export interface ExperienceInfo {
  band: ExperienceBandId | ''
  currentRole: string
  currentCompany: string
  industry: string
  hasLeadershipExperience: boolean
}

export interface SkillEntry {
  id: string
  name: string
  proficiency: number // 0-100
}

export interface CertificationEntry {
  id: string
  name: string
  issuer: string
  year: number | ''
}

export type AchievementCategory =
  | 'cost_saving'
  | 'revenue_impact'
  | 'leadership'
  | 'award'
  | 'promotion'
  | 'publication'
  | 'competition'
  | 'product_adoption'
  | 'other'

export const ACHIEVEMENT_CATEGORIES: { id: AchievementCategory; label: string }[] = [
  { id: 'cost_saving', label: 'Cost Reduction' },
  { id: 'revenue_impact', label: 'Revenue Impact' },
  { id: 'leadership', label: 'Team Leadership' },
  { id: 'award', label: 'Award / Recognition' },
  { id: 'promotion', label: 'Promotion' },
  { id: 'publication', label: 'Publication' },
  { id: 'competition', label: 'Competition' },
  { id: 'product_adoption', label: 'Product Adoption' },
  { id: 'other', label: 'Other' },
]

export interface AchievementEntry {
  id: string
  title: string
  category: AchievementCategory
  year: number | ''
}

export const LOCATIONS = [
  'Delhi NCR',
  'Bangalore',
  'Mumbai',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Remote',
  'Global',
] as const
export type LocationName = (typeof LOCATIONS)[number]

export interface LocationInfo {
  current: LocationName | ''
  targetMarket: string // free text market, e.g. "India", "UAE"
  targetCity: LocationName | ''
}

export interface Profile {
  role: RoleType | null
  domain: DomainId | null
  education: EducationInfo
  experience: ExperienceInfo
  skills: SkillEntry[]
  certifications: CertificationEntry[]
  achievements: AchievementEntry[]
  location: LocationInfo
}

export function createEmptyProfile(): Profile {
  return {
    role: null,
    domain: null,
    education: { qualification: '', specialization: '', institute: '', graduationYear: '', marks: '' },
    experience: { band: '', currentRole: '', currentCompany: '', industry: '', hasLeadershipExperience: false },
    skills: [],
    certifications: [],
    achievements: [],
    location: { current: '', targetMarket: '', targetCity: '' },
  }
}

export function experienceYears(profile: Profile): number {
  const band = EXPERIENCE_BANDS.find((b) => b.id === profile.experience.band)
  return band ? band.years : 0
}
