import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { NasaAssetResponse, NasaSearchResponse } from '@/api/types'
import { jsonResponse, renderRoute, toRequestUrl } from '@/test/render-route'
import {
  makeAssetResponse,
  makeSearchItem,
  makeSearchResponse,
} from '@/test/fixtures'

const NASA_ID = 'as11-40-5874'

const fetchMock = vi.fn<typeof fetch>()

/** Routes mocked requests by endpoint, like the real API. */
function mockApi({
  search = makeSearchResponse([
    makeSearchItem({
      nasa_id: NASA_ID,
      title: 'Buzz Aldrin on the Moon',
      description:
        '<p>Astronaut Buzz Aldrin<br>walks on the <b>Moon</b>.</p><script>alert(1)</script>',
      keywords: ['Apollo 11', 'Moon', 'EVA'],
      location: 'Sea of Tranquility',
      photographer: 'Neil Armstrong',
      date_created: '1969-07-20T00:00:00Z',
    }),
  ]),
  assets = makeAssetResponse(NASA_ID),
  assetsStatus = 200,
}: {
  search?: NasaSearchResponse
  assets?: NasaAssetResponse | object
  assetsStatus?: number
} = {}) {
  fetchMock.mockImplementation((input) => {
    const url = toRequestUrl(input)
    return Promise.resolve(
      url.pathname.startsWith('/asset/')
        ? jsonResponse(assets, assetsStatus)
        : jsonResponse(search),
    )
  })
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})

describe('Details page', () => {
  it('renders all fields and the image versions', async () => {
    mockApi()

    renderRoute(`/image/${NASA_ID}`)

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Buzz Aldrin on the Moon',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Sea of Tranquility')).toBeInTheDocument()
    expect(screen.getByText('Neil Armstrong')).toBeInTheDocument()
    expect(screen.getByText('July 20, 1969')).toBeInTheDocument()

    const keywords = screen.getByRole('list', { name: 'Keywords' })
    expect(
      within(keywords)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual(['Apollo 11', 'Moon', 'EVA'])

    // HTML is stripped and rendered as text; scripts are dropped.
    const description = screen.getByText(/Astronaut Buzz Aldrin/)
    expect(description.textContent).toBe(
      'Astronaut Buzz Aldrin\nwalks on the Moon.',
    )
    expect(description.querySelector('b, br, script')).toBeNull()

    // Both requests are made: details via search, versions via the asset manifest.
    const urls = fetchMock.mock.calls.map(([input]) => toRequestUrl(input))
    expect(urls.map((u) => u.pathname).sort()).toEqual([
      `/asset/${NASA_ID}`,
      '/search',
    ])
    const searchUrl = urls.find((u) => u.pathname === '/search')
    expect(searchUrl?.searchParams.get('nasa_id')).toBe(NASA_ID)
    expect(searchUrl?.searchParams.get('media_type')).toBe('image')

    const versions = await screen.findByRole('region', {
      name: 'Image versions',
    })
    const links = within(versions).getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual(
      ['Original', 'Large', 'Medium', 'Small', 'Thumbnail'].map(
        (name) => `${name}jpg(opens in a new tab)`,
      ),
    )
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      expect(link.getAttribute('href')).toMatch(
        /^https:\/\/images-assets\.nasa\.gov\//,
      )
    }
    expect(links[0]).toHaveAttribute(
      'href',
      `https://images-assets.nasa.gov/image/${NASA_ID}/${NASA_ID}~orig.jpg`,
    )

    // The main preview uses the large version.
    expect(
      screen.getByRole('img', { name: 'Buzz Aldrin on the Moon' }),
    ).toHaveAttribute(
      'src',
      `https://images-assets.nasa.gov/image/${NASA_ID}/${NASA_ID}~large.jpg`,
    )
  })

  it('shows "Not available" for missing optional fields', async () => {
    mockApi({
      search: makeSearchResponse([
        makeSearchItem({
          nasa_id: NASA_ID,
          description: undefined,
          keywords: undefined,
        }),
      ]),
    })

    renderRoute(`/image/${NASA_ID}`)

    await screen.findByRole('heading', { level: 1 })
    // Location, photographer, keywords and description.
    expect(screen.getAllByText('Not available')).toHaveLength(4)
  })

  it('shows the not-found state when no image has that id', async () => {
    mockApi({
      search: makeSearchResponse([]),
      assets: { reason: 'Not found' },
      assetsStatus: 404,
    })

    renderRoute('/image/does-not-exist')

    expect(
      await screen.findByRole('heading', { name: 'Image not found' }),
    ).toBeInTheDocument()
  })

  it('shows an error with the HTTP status when the versions fail to load', async () => {
    mockApi({ assets: { reason: 'Server error' }, assetsStatus: 500 })

    renderRoute(`/image/${NASA_ID}`)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Could not load the image versions.')
    expect(alert).toHaveTextContent('HTTP status 500')
    expect(
      within(alert).getByRole('button', { name: 'Retry' }),
    ).toBeInTheDocument()
  })

  it('goes to the Search page when opened directly', async () => {
    mockApi()
    const user = userEvent.setup()
    const { router } = renderRoute(`/image/${NASA_ID}`)

    await user.click(
      await screen.findByRole('button', { name: 'Back to search' }),
    )

    expect(router.state.location.pathname).toBe('/')
  })

  it('goes back to the previous search, served from the cache', async () => {
    fetchMock.mockImplementation((input) => {
      const url = toRequestUrl(input)
      if (url.pathname.startsWith('/asset/')) {
        return Promise.resolve(jsonResponse(makeAssetResponse(NASA_ID)))
      }
      return Promise.resolve(
        jsonResponse(
          makeSearchResponse([
            makeSearchItem({
              nasa_id: NASA_ID,
              title: 'Buzz Aldrin on the Moon',
            }),
          ]),
        ),
      )
    })
    const user = userEvent.setup()
    const { router } = renderRoute('/?q=apollo&yearStart=1969')

    await user.click(await screen.findByRole('link', { name: /Buzz Aldrin/ }))
    await screen.findByRole('heading', {
      level: 1,
      name: 'Buzz Aldrin on the Moon',
    })
    const requestsBeforeBack = fetchMock.mock.calls.length

    await user.click(screen.getByRole('button', { name: 'Back to search' }))

    expect(
      await screen.findByRole('list', { name: 'Search results' }),
    ).toBeInTheDocument()
    expect(router.state.location.search).toEqual({
      q: 'apollo',
      yearStart: '1969',
    })
    expect(screen.getByLabelText('Query')).toHaveValue('apollo')
    expect(fetchMock).toHaveBeenCalledTimes(requestsBeforeBack)
  })
})
