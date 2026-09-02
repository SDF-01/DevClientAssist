import { localPurgeOldRevisions } from '@/lib/data/localStore'

export interface RetentionPolicy {
  retentionDays: number
  purgeDoneOnly: boolean
}

const DEFAULT_POLICY: RetentionPolicy = {
  retentionDays: 365,
  purgeDoneOnly: true,
}

export function runRetentionPolicy(policy: RetentionPolicy = DEFAULT_POLICY): number {
  return localPurgeOldRevisions(policy.retentionDays)
}

export function getRetentionPolicy(): RetentionPolicy {
  const raw = localStorage.getItem('revision-portal-retention')
  return raw ? (JSON.parse(raw) as RetentionPolicy) : DEFAULT_POLICY
}

export function setRetentionPolicy(policy: RetentionPolicy) {
  localStorage.setItem('revision-portal-retention', JSON.stringify(policy))
}
