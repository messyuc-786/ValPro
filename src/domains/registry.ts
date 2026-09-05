import type { DomainId } from '../types/profile'
import type { DomainPack } from '../types/domain'
import { technologyPack } from './technology'
import { bankingPack } from './banking'
import { educationPack } from './education'
import { fresherPack } from './fresher'

/**
 * Domain pack registry. Adding a new domain (Healthcare, Marketing, Legal, ...)
 * means writing one new pack file and registering it here — the valuation
 * engine and every screen are domain-agnostic and never branch on `domainId`.
 */
export const domainRegistry: Record<DomainId, DomainPack> = {
  technology: technologyPack,
  banking: bankingPack,
  education: educationPack,
  fresher: fresherPack,
}

export function getDomainPack(domainId: DomainId): DomainPack {
  return domainRegistry[domainId]
}
