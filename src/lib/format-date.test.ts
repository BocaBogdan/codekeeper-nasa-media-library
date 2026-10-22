import { describe, expect, it } from 'vitest'

import { formatDate } from '@/lib/format-date'

describe('formatDate', () => {
  it('formats an ISO date as a long date', () => {
    expect(formatDate('1969-07-20T00:00:00Z')).toBe('July 20, 1969')
  })

  it('does not shift midnight UTC dates to the previous day', () => {
    expect(formatDate('2000-01-01T00:00:00Z')).toBe('January 1, 2000')
  })

  it('returns the input when it is not a valid date', () => {
    expect(formatDate('unknown')).toBe('unknown')
  })
})
