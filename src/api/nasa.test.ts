import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  NasaApiError,
  getImageAssets,
  getImageDetails,
  searchImages,
} from '@/api/nasa'
import { jsonResponse, toRequestUrl } from '@/test/render-route'
import {
  makeAssetResponse,
  makeSearchItem,
  makeSearchResponse,
} from '@/test/fixtures'

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})

function requestedUrl(call = 0): URL {
  return toRequestUrl(fetchMock.mock.calls[call][0])
}

describe('searchImages', () => {
  it('builds the search URL with the required params', async () => {
    fetchMock.mockResolvedValue(jsonResponse(makeSearchResponse([])))

    await searchImages({ q: 'apollo 11' })

    const url = requestedUrl()
    expect(url.origin + url.pathname).toBe('https://images-api.nasa.gov/search')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      q: 'apollo 11',
      media_type: 'image',
      page: '1',
      page_size: '24',
    })
  })

  it('always sends media_type=image and adds years only when provided', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse(makeSearchResponse([]))),
    )

    await searchImages({ q: 'mars', yearStart: '1990', page: 3 })
    await searchImages({ q: 'mars', yearEnd: '2000' })

    const first = requestedUrl(0).searchParams
    expect(first.get('media_type')).toBe('image')
    expect(first.get('page')).toBe('3')
    expect(first.get('year_start')).toBe('1990')
    expect(first.has('year_end')).toBe(false)

    const second = requestedUrl(1).searchParams
    expect(second.get('media_type')).toBe('image')
    expect(second.has('year_start')).toBe(false)
    expect(second.get('year_end')).toBe('2000')
  })

  it('maps items and pagination', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        makeSearchResponse(
          [
            makeSearchItem({
              nasa_id: 'a',
              location: 'Moon',
              photographer: 'Neil',
            }),
            makeSearchItem(
              { nasa_id: 'b', keywords: undefined },
              { withThumbnail: false },
            ),
          ],
          { totalHits: 50, hasNext: true },
        ),
      ),
    )

    const page = await searchImages({ q: 'apollo', page: 1 })

    expect(page.totalHits).toBe(50)
    expect(page.nextPage).toBe(2)
    expect(page.items[0]).toMatchObject({
      nasaId: 'a',
      location: 'Moon',
      photographer: 'Neil',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/a/a~thumb.jpg',
    })
    expect(page.items[1]).toMatchObject({
      nasaId: 'b',
      keywords: [],
      thumbnailUrl: undefined,
    })
  })

  it('has no next page without a "next" link', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(makeSearchResponse([makeSearchItem()])),
    )

    expect((await searchImages({ q: 'apollo' })).nextPage).toBeUndefined()
  })

  it('throws a NasaApiError with the HTTP status on non-2xx responses', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ reason: 'boom' }, 500))

    const error = await searchImages({ q: 'apollo' }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(NasaApiError)
    expect(error).toMatchObject({ status: 500 })
  })
})

describe('getImageDetails', () => {
  it('searches by nasa_id and returns the matching item', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(makeSearchResponse([makeSearchItem({ nasa_id: 'id 1/2' })])),
    )

    const image = await getImageDetails('id 1/2')

    const url = requestedUrl()
    expect(url.pathname).toBe('/search')
    expect(url.searchParams.get('nasa_id')).toBe('id 1/2')
    expect(url.searchParams.get('media_type')).toBe('image')
    expect(image?.nasaId).toBe('id 1/2')
  })

  it('returns null when nothing matches', async () => {
    fetchMock.mockResolvedValue(jsonResponse(makeSearchResponse([])))

    expect(await getImageDetails('missing')).toBeNull()
  })
})

describe('getImageAssets', () => {
  it('encodes the id and returns the image versions', async () => {
    fetchMock.mockResolvedValue(jsonResponse(makeAssetResponse('PIA001')))

    const versions = await getImageAssets('PIA 001/x')

    expect(requestedUrl().pathname).toBe('/asset/PIA%20001%2Fx')
    expect(versions.map((v) => v.label)).toEqual([
      'orig',
      'large',
      'medium',
      'small',
      'thumb',
    ])
  })

  it('throws a NasaApiError on 404', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ reason: 'not found' }, 404))

    await expect(getImageAssets('missing')).rejects.toMatchObject({
      name: 'NasaApiError',
      status: 404,
    })
  })
})
