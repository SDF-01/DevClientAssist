import { describe, expect, it } from 'vitest'
import { getAuthRedirectUrl, PRODUCTION_SITE_URL } from '@/lib/authRedirect'

describe('authRedirect', () => {
  it('sends confirmation emails back to this app callback, not localhost:3000', () => {
    const redirect = getAuthRedirectUrl()
    expect(redirect).toBe(`${PRODUCTION_SITE_URL}/auth/callback`)
    expect(redirect.includes('localhost:3000')).toBe(false)
  })
})
