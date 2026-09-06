import type { DomainId } from '../types/profile'
import type { DomainPack } from '../types/domain'
import { technologyPack } from './technology'
import { bankingPack } from './banking'
import { educationPack } from './education'
import { fresherPack } from './fresher'
import { insufficientDomainPacks } from './insufficientDomains'

/**
 * Domain pack registry. Adding a new domain with REAL data means writing one
 * new pack file (benchmarkStatus: 'demo') and registering it here in place
 * of its insufficientDomains.ts entry — the valuation engine and every
 * screen are domain-agnostic and never branch on `domainId`.
 */
export const domainRegistry: Record<DomainId, DomainPack> = {
  technology: technologyPack,
  banking: bankingPack,
  education: educationPack,
  fresher: fresherPack,
  ...insufficientDomainPacks,
} as Record<DomainId, DomainPack>

export function getDomainPack(domainId: DomainId): DomainPack {
  return domainRegistry[domainId]
}
