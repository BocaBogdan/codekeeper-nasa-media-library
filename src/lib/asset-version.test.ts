import { describe, expect, it } from 'vitest'

import {
  parseAssetVersion,
  pickPreviewVersion,
  toImageVersions,
} from '@/lib/asset-version'

const base = 'http://images-assets.nasa.gov/image/PIA001/PIA001'

describe('parseAssetVersion', () => {
  it.each([
    [`${base}~orig.jpg`, { label: 'orig', extension: 'jpg' }],
    [`${base}~large.JPG`, { label: 'large', extension: 'jpg' }],
    [`${base}~medium.png`, { label: 'medium', extension: 'png' }],
    [`${base}~small.jpg?x=1`, { label: 'small', extension: 'jpg' }],
    [`${base}~thumb.jpg`, { label: 'thumb', extension: 'jpg' }],
  ])('parses %s', (href, expected) => {
    expect(parseAssetVersion(href)).toEqual(expected)
  })

  it.each([
    'http://images-assets.nasa.gov/image/PIA001/metadata.json',
    `${base}.jpg`,
    `${base}~preview.jpg`,
  ])('returns null for %s', (href) => {
    expect(parseAssetVersion(href)).toBeNull()
  })
})

describe('toImageVersions', () => {
  it('drops metadata.json, upgrades to https and sorts by size', () => {
    const versions = toImageVersions([
      `${base}~thumb.jpg`,
      'http://images-assets.nasa.gov/image/PIA001/metadata.json',
      `${base}~medium.jpg`,
      `${base}~orig.tif`,
      `${base}~large.jpg`,
    ])

    const secureBase = 'https://images-assets.nasa.gov/image/PIA001/PIA001'
    expect(versions).toEqual([
      { label: 'orig', extension: 'tif', url: `${secureBase}~orig.tif` },
      { label: 'large', extension: 'jpg', url: `${secureBase}~large.jpg` },
      { label: 'medium', extension: 'jpg', url: `${secureBase}~medium.jpg` },
      { label: 'thumb', extension: 'jpg', url: `${secureBase}~thumb.jpg` },
    ])
  })
})

describe('pickPreviewVersion', () => {
  it('prefers large, then medium', () => {
    const versions = toImageVersions([
      `${base}~medium.jpg`,
      `${base}~large.jpg`,
    ])
    expect(pickPreviewVersion(versions)?.label).toBe('large')
    expect(pickPreviewVersion(versions.slice(1))?.label).toBe('medium')
  })

  it('skips formats browsers cannot display', () => {
    const versions = toImageVersions([`${base}~large.tif`, `${base}~small.jpg`])
    expect(pickPreviewVersion(versions)?.label).toBe('small')
  })

  it('returns undefined when there is nothing to show', () => {
    expect(pickPreviewVersion([])).toBeUndefined()
  })
})
