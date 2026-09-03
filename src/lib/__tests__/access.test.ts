import { describe, expect, it } from 'vitest'
import {
  isInternalRole,
  isOwnerEmail,
  resolveUserRole,
  SITE_OWNER_EMAIL,
} from '@/lib/access'

describe('access', () => {
  it('treats the site owner email as admin regardless of stored role', () => {
    expect(SITE_OWNER_EMAIL).toBe('mandrewschaeffer@gmail.com')
    expect(isOwnerEmail('  MandrewSchaeffer@Gmail.com ')).toBe(true)
    expect(resolveUserRole(SITE_OWNER_EMAIL, 'client_viewer')).toBe('admin')
    expect(isInternalRole(resolveUserRole(SITE_OWNER_EMAIL))).toBe(true)
  })

  it('leaves other emails on their stored role or the client default', () => {
    expect(isOwnerEmail('someone@example.com')).toBe(false)
    expect(resolveUserRole('someone@example.com', 'developer')).toBe('developer')
    expect(resolveUserRole('someone@example.com')).toBe('client_editor')
    expect(resolveUserRole(null, 'not-a-role')).toBe('client_editor')
  })
})
