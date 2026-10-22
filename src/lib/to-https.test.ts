import { describe, expect, it } from 'vitest'

import { toHttps } from '@/lib/to-https'

describe('toHttps', () => {
  it('upgrades http URLs', () => {
    expect(toHttps('http://images-assets.nasa.gov/a~orig.jpg')).toBe(
      'https://images-assets.nasa.gov/a~orig.jpg',
    )
  })

  it('leaves https URLs unchanged', () => {
    expect(toHttps('https://images-assets.nasa.gov/a.jpg')).toBe(
      'https://images-assets.nasa.gov/a.jpg',
    )
  })
})
