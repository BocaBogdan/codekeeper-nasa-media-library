import { describe, expect, it } from 'vitest'

import { parseSearch, stringifySearch } from '@/lib/search-serialization'

describe('search serialization', () => {
  it('keeps years and numeric queries as plain strings', () => {
    const search = { q: '2020', yearStart: '1969', yearEnd: '1972' }
    const str = stringifySearch(search)

    expect(str).toBe('?q=2020&yearStart=1969&yearEnd=1972')
    expect(parseSearch(str)).toEqual(search)
  })

  it('omits empty values', () => {
    expect(
      stringifySearch({ q: 'mars', yearStart: undefined, yearEnd: '' }),
    ).toBe('?q=mars')
    expect(stringifySearch({})).toBe('')
  })

  it('encodes special characters', () => {
    const str = stringifySearch({ q: 'a&b c' })
    expect(parseSearch(str)).toEqual({ q: 'a&b c' })
  })
})
