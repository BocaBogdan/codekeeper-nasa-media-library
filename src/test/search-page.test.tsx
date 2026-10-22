import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { jsonResponse, renderRoute, toRequestUrl } from '@/test/render-route'
import { makeSearchItem, makeSearchResponse } from '@/test/fixtures'

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})

function requestedParams(call = 0): URLSearchParams {
  return toRequestUrl(fetchMock.mock.calls[call][0]).searchParams
}

describe('Search page', () => {
  it('renders results from the API', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        makeSearchResponse([
          makeSearchItem({
            nasa_id: 'as11-40-5874',
            title: 'Buzz Aldrin on the Moon',
            location: 'Sea of Tranquility',
            photographer: 'Neil Armstrong',
          }),
          makeSearchItem(
            { nasa_id: 'id with/slash', title: 'No thumbnail here' },
            { withThumbnail: false },
          ),
        ]),
      ),
    )

    renderRoute('/?q=apollo&yearStart=1969')

    const list = await screen.findByRole('list', { name: 'Search results' })
    const cards = within(list).getAllByRole('link')
    expect(cards).toHaveLength(2)

    expect(cards[0]).toHaveAttribute('href', '/image/as11-40-5874')
    expect(
      within(cards[0]).getByText('Buzz Aldrin on the Moon'),
    ).toBeInTheDocument()
    expect(within(cards[0]).getByText('Sea of Tranquility')).toBeInTheDocument()
    expect(within(cards[0]).getByText('Neil Armstrong')).toBeInTheDocument()
    expect(within(cards[0]).getByRole('img')).toHaveAttribute(
      'src',
      'https://images-assets.nasa.gov/image/as11-40-5874/as11-40-5874~thumb.jpg',
    )

    // Unsafe characters in the id are encoded; missing thumbnail → placeholder.
    expect(cards[1]).toHaveAttribute('href', '/image/id%20with%2Fslash')
    expect(
      within(cards[1]).getByRole('img', { name: /image not available/ }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/reached the end of the results/),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Query')).toHaveValue('apollo')

    const params = requestedParams()
    expect(params.get('q')).toBe('apollo')
    expect(params.get('year_start')).toBe('1969')
    expect(params.get('media_type')).toBe('image')
  })

  it('does not search until the form is submitted, then updates the URL', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(makeSearchResponse([makeSearchItem()])),
    )
    const user = userEvent.setup()
    const { router } = renderRoute('/')

    await user.type(await screen.findByLabelText('Query'), 'saturn')
    expect(fetchMock).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('Year End'), '2010')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    await screen.findByRole('list', { name: 'Search results' })
    expect(router.state.location.search).toEqual({
      q: 'saturn',
      yearEnd: '2010',
    })
    expect(requestedParams().get('q')).toBe('saturn')
    expect(requestedParams().get('year_end')).toBe('2010')
  })

  it('does not send a request for invalid URL params', async () => {
    renderRoute('/?q=mars&yearStart=abc')

    await screen.findByLabelText('Query')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows skeletons while loading the first page', async () => {
    fetchMock.mockReturnValue(new Promise(() => {}))

    renderRoute('/?q=apollo')

    expect(
      await screen.findByRole('status', { name: 'Loading results' }),
    ).toBeInTheDocument()
  })

  it('shows the empty state', async () => {
    fetchMock.mockResolvedValue(jsonResponse(makeSearchResponse([])))

    renderRoute('/?q=nothing-matches')

    expect(
      await screen.findByText(/No results found for “nothing-matches”/),
    ).toBeInTheDocument()
  })

  it('shows the error state with the HTTP status and retries', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ reason: 'Server error' }, 503))
      .mockResolvedValueOnce(
        jsonResponse(makeSearchResponse([makeSearchItem()])),
      )
    const user = userEvent.setup()

    renderRoute('/?q=apollo')

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('HTTP status 503')

    await user.click(within(alert).getByRole('button', { name: 'Retry' }))

    expect(
      await screen.findByRole('list', { name: 'Search results' }),
    ).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('loads the next page when the sentinel becomes visible', async () => {
    let triggerIntersection: () => void = () => {}
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          triggerIntersection = () =>
            callback(
              [{ isIntersecting: true } as IntersectionObserverEntry],
              this as unknown as IntersectionObserver,
            )
        }
        observe() {}
        disconnect() {}
      },
    )
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(
          makeSearchResponse([makeSearchItem({ nasa_id: 'p1' })], {
            totalHits: 2,
            hasNext: true,
          }),
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse(makeSearchResponse([makeSearchItem({ nasa_id: 'p2' })])),
      )

    renderRoute('/?q=apollo')
    const list = await screen.findByRole('list', { name: 'Search results' })
    expect(within(list).getAllByRole('link')).toHaveLength(1)
    expect(screen.queryByText(/reached the end/)).not.toBeInTheDocument()

    triggerIntersection()

    await waitFor(() => {
      expect(within(list).getAllByRole('link')).toHaveLength(2)
    })
    expect(requestedParams(1).get('page')).toBe('2')
    expect(
      screen.getByText(/reached the end of the results/),
    ).toBeInTheDocument()
  })
})
