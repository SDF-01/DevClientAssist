import { isOwnerEmail, normalizeEmail } from '@/lib/access'
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'
import type { AccountRequest, AccountRequestStatus } from '@/types/database'

export type AccountAccessStatus = 'approved' | 'pending' | 'denied' | 'none'
export type { AccountRequest, AccountRequestStatus }

function asAccessStatus(value: string | null | undefined): AccountAccessStatus {
  switch (value) {
    case 'approved':
    case 'pending':
    case 'denied':
    case 'none':
      return value
    default: {
      const _exhaustive: never = value as never
      void _exhaustive
      return 'none'
    }
  }
}

export async function getAccountAccess(email: string): Promise<AccountAccessStatus> {
  if (isOwnerEmail(email)) return 'approved'
  if (!isSupabaseConfigured || !supabase) return 'none'

  const { data, error } = await supabase.rpc('get_account_access', {
    check_email: normalizeEmail(email),
  })
  if (error) throw error
  return asAccessStatus(typeof data === 'string' ? data : 'none')
}

export async function requestAccountAccess(email: string, fullName = ''): Promise<AccountAccessStatus> {
  if (isOwnerEmail(email)) return 'approved'
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Account requests are not available without Supabase.')
  }

  const { data, error } = await supabase.rpc('request_account_access', {
    request_email: normalizeEmail(email),
    request_name: fullName,
  })
  if (error) throw error
  return asAccessStatus(typeof data === 'string' ? data : 'pending')
}

export async function reviewAccountAccess(
  email: string,
  status: Extract<AccountRequestStatus, 'approved' | 'denied'>,
): Promise<AccountRequestStatus> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Account review is not available without Supabase.')
  }

  const { data, error } = await supabase.rpc('review_account_access', {
    target_email: normalizeEmail(email),
    next_status: status,
  })
  if (error) throw error
  return data === 'denied' ? 'denied' : 'approved'
}

export async function listAccountRequests(): Promise<AccountRequest[]> {
  if (!isSupabaseConfigured || !supabase) return []

  const { data, error } = await supabase
    .from('account_requests')
    .select('id, email, full_name, status, created_at, reviewed_at, reviewer_email')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as AccountRequest[]
}
