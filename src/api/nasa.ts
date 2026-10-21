import type { NasaImage, NasaSearchItem, NasaSearchResponse, SearchImagesParams, SearchPage, } from '@/api/types'

/** Thrown for non-2xx responses; carries the HTTP status. */
export class NasaApiError extends Error {
  readonly status: number

  constructor(status: number, message?: string) {
    super(message ?? `NASA API request failed with HTTP status ${status}`)
    this.name = 'NasaApiError'
    this.status = status
  }
}

async function fetchJson<T>(url: URL, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new NasaApiError(response.status)
  return (await response.json()) as T
}

export function buildSearchUrl({
  q,
  yearStart,
  yearEnd,
  page = 1,
}: SearchImagesParams): URL {
  const url = new URL('/search', import.meta.env.VITE_NASA_API_URL)
  url.searchParams.set('q', q)
  url.searchParams.set('media_type', 'image')
  url.searchParams.set('page', String(page))
  url.searchParams.set('page_size', String(import.meta.env.VITE_PAGE_SIZE))
  if (yearStart) url.searchParams.set('year_start', yearStart)
  if (yearEnd) url.searchParams.set('year_end', yearEnd)
  return url
}

export function mapSearchItem(item: NasaSearchItem): NasaImage | null {
  const data = item.data[0]
  if (!data) return null

  // The thumbnail is not necessarily links[0]: look it up by rel.
  const preview = item.links?.find((link) => link.rel === 'preview')

  return {
    nasaId: data.nasa_id,
    title: data.title,
    description: data.description,
    keywords: data.keywords ?? [],
    location: data.location,
    photographer: data.photographer,
    dateCreated: data.date_created,
    thumbnailUrl: preview?.href?.replace(/^http:\/\//i, 'https://'),
  }
}

function mapItems(items: NasaSearchItem[]): NasaImage[] {
  return items.map(mapSearchItem).filter((item) => item !== null)
}

export async function searchImages(
  params: SearchImagesParams,
  signal?: AbortSignal,
): Promise<SearchPage> {
  const page = params.page ?? 1
  const { collection } = await fetchJson<NasaSearchResponse>(
    buildSearchUrl({ ...params, page }),
    signal,
  )
  const hasNext = collection.links?.some((link) => link.rel === 'next')

  return {
    items: mapItems(collection.items),
    totalHits: collection.metadata.total_hits,
    nextPage: hasNext ? page + 1 : undefined,
  }
}
