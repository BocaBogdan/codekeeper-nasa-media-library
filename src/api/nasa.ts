import type {
  ImageVersion,
  NasaAssetResponse,
  NasaImage,
  NasaSearchItem,
  NasaSearchResponse,
  SearchImagesParams,
  SearchPage,
} from '@/api/types'
import { toImageVersions } from '@/lib/asset-version'
import { toHttps } from '@/lib/to-https'

export const NASA_API_BASE_URL = 'https://images-api.nasa.gov'
export const PAGE_SIZE = 24

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
  const url = new URL('/search', NASA_API_BASE_URL)
  url.searchParams.set('q', q)
  url.searchParams.set('media_type', 'image')
  url.searchParams.set('page', String(page))
  url.searchParams.set('page_size', String(PAGE_SIZE))
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
    thumbnailUrl: preview ? toHttps(preview.href) : undefined,
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

/**
 * The API has no "get by id" endpoint, so this searches by `nasa_id`.
 * Resolves to `null` when no image has that id.
 */
export async function getImageDetails(
  nasaId: string,
  signal?: AbortSignal,
): Promise<NasaImage | null> {
  const url = new URL('/search', NASA_API_BASE_URL)
  url.searchParams.set('nasa_id', nasaId)
  url.searchParams.set('media_type', 'image')

  const { collection } = await fetchJson<NasaSearchResponse>(url, signal)
  return mapItems(collection.items).find((i) => i.nasaId === nasaId) ?? null
}

export async function getImageAssets(
  nasaId: string,
  signal?: AbortSignal,
): Promise<ImageVersion[]> {
  const url = new URL(`/asset/${encodeURIComponent(nasaId)}`, NASA_API_BASE_URL)

  const { collection } = await fetchJson<NasaAssetResponse>(url, signal)
  return toImageVersions(collection.items.map((item) => item.href))
}
