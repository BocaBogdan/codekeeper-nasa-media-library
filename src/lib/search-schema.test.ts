import { describe, expect, it } from 'vitest'

import {
  searchFormSchema,
  toSearchCriteria,
  toSearchParams,
} from '@/lib/search-schema'

function errorsOf(input: Record<string, string>) {
  const result = searchFormSchema.safeParse({
    q: '',
    yearStart: '',
    yearEnd: '',
    ...input,
  })
  return result.success
    ? {}
    : Object.fromEntries(
        result.error.issues.map((issue) => [
          issue.path.join('.'),
          issue.message,
        ]),
      )
}

describe('searchFormSchema', () => {
  it('requires a non-empty query after trimming', () => {
    expect(errorsOf({ q: '' })).toHaveProperty('q')
    expect(errorsOf({ q: '   ' })).toHaveProperty('q')
    expect(errorsOf({ q: 'apollo' })).toEqual({})
  })

  it('trims the query', () => {
    expect(
      searchFormSchema.parse({ q: '  apollo ', yearStart: '', yearEnd: '' }).q,
    ).toBe('apollo')
  })

  it.each(['69', '19690', 'abcd', '1969a'])('rejects the year "%s"', (year) => {
    expect(errorsOf({ q: 'apollo', yearStart: year })).toHaveProperty(
      'yearStart',
    )
    expect(errorsOf({ q: 'apollo', yearEnd: year })).toHaveProperty('yearEnd')
  })

  it('accepts empty or 4-digit years', () => {
    expect(errorsOf({ q: 'apollo', yearStart: '1969' })).toEqual({})
    expect(errorsOf({ q: 'apollo', yearEnd: '1972' })).toEqual({})
  })

  it('requires yearStart <= yearEnd when both are filled in', () => {
    expect(
      errorsOf({ q: 'apollo', yearStart: '1972', yearEnd: '1969' }),
    ).toHaveProperty('yearEnd')
    expect(
      errorsOf({ q: 'apollo', yearStart: '1969', yearEnd: '1969' }),
    ).toEqual({})
    expect(
      errorsOf({ q: 'apollo', yearStart: '1969', yearEnd: '1972' }),
    ).toEqual({})
  })
})

describe('toSearchParams', () => {
  it('omits empty years', () => {
    expect(
      toSearchParams({ q: 'mars', yearStart: '', yearEnd: '2000' }),
    ).toEqual({
      q: 'mars',
      yearStart: undefined,
      yearEnd: '2000',
    })
  })
})

describe('toSearchCriteria', () => {
  it('returns null when there is no query', () => {
    expect(toSearchCriteria({})).toBeNull()
  })

  it('returns null for invalid URL params', () => {
    expect(toSearchCriteria({ q: 'mars', yearStart: 'abc' })).toBeNull()
    expect(
      toSearchCriteria({ q: 'mars', yearStart: '2000', yearEnd: '1990' }),
    ).toBeNull()
  })

  it('returns trimmed criteria for valid params', () => {
    expect(toSearchCriteria({ q: ' mars ', yearStart: '1990' })).toEqual({
      q: 'mars',
      yearStart: '1990',
      yearEnd: undefined,
    })
  })
})
