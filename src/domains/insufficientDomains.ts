import type { DomainPack } from '../types/domain'
import { DOMAIN_OPTIONS } from '../types/profile'
import type { DomainId } from '../types/profile'

/**
 * Every domain that does NOT yet have a calibrated benchmark model (see
 * technology.ts / banking.ts / education.ts / fresher.ts for the ones that
 * do). These are fully selectable in Domain Selection — the taxonomy is
 * intentionally broad — but the valuation engine returns an honest
 * "insufficient market evidence" result for them instead of a fabricated
 * number (see valuationEngine.ts and DomainPack.benchmarkStatus).
 *
 * Adding real data for one of these later means authoring a benchmark
 * object for it (see any of the four existing packs as a template) and
 * changing its status to 'demo' — nothing else in the app needs to change.
 */
const BENCHMARKED_IDS = new Set<DomainId>(['technology', 'banking', 'education', 'fresher'])

export const insufficientDomainPacks: Partial<Record<DomainId, DomainPack>> = Object.fromEntries(
  DOMAIN_OPTIONS.filter((d) => !BENCHMARKED_IDS.has(d.id)).map((d) => [
    d.id,
    {
      id: d.id,
      label: d.label,
      shortLabel: d.label,
      description: d.detail,
      benchmarkStatus: 'insufficient',
    } satisfies DomainPack,
  ]),
)
