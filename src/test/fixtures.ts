import type {
  NasaAssetResponse,
  NasaSearchItem,
  NasaSearchResponse,
} from '@/api/types'

export function makeSearchItem(
  overrides: Partial<NasaSearchItem['data'][number]> = {},
  options: { withThumbnail?: boolean } = {},
): NasaSearchItem {
  const nasaId = overrides.nasa_id ?? 'as11-40-5874'
  const base = `https://images-assets.nasa.gov/image/${nasaId}/${nasaId}`

  return {
    href: `https://images-assets.nasa.gov/image/${nasaId}/collection.json`,
    data: [
      {
        nasa_id: nasaId,
        title: 'Apollo 11 Mission image',
        description: 'Astronaut on the Moon.',
        keywords: ['Apollo 11', 'Moon'],
        media_type: 'image',
        center: 'JSC',
        date_created: '1969-07-20T00:00:00Z',
        ...overrides,
      },
    ],
    // Like the real API, the preview link is not the first one.
    links:
      options.withThumbnail === false
        ? undefined
        : [
            { href: `${base}~medium.jpg`, rel: 'alternate', render: 'image' },
            { href: `${base}~thumb.jpg`, rel: 'preview', render: 'image' },
          ],
  }
}

export function makeSearchResponse(
  items: NasaSearchItem[],
  { totalHits = items.length, hasNext = false } = {},
): NasaSearchResponse {
  return {
    collection: {
      version: '1.0',
      href: 'http://images-api.nasa.gov/search',
      items,
      metadata: { total_hits: totalHits },
      links: hasNext
        ? [
            {
              rel: 'next',
              prompt: 'Next',
              href: 'http://images-api.nasa.gov/search?page=2',
            },
          ]
        : undefined,
    },
  }
}

export function makeAssetResponse(nasaId: string): NasaAssetResponse {
  const base = `http://images-assets.nasa.gov/image/${nasaId}/${nasaId}`
  return {
    collection: {
      version: '1.1',
      href: `http://images-api.nasa.gov/asset/${nasaId}`,
      items: [
        { href: `${base}~orig.jpg` },
        { href: `${base}~large.jpg` },
        { href: `${base}~medium.jpg` },
        { href: `${base}~small.jpg` },
        { href: `${base}~thumb.jpg` },
        { href: `http://images-assets.nasa.gov/image/${nasaId}/metadata.json` },
      ],
    },
  }
}
