// ---------------------------------------------------------------------------
// Raw API response shapes (https://images-api.nasa.gov)
// Verified against the live API; only the fields this app relies on are typed.
// ---------------------------------------------------------------------------

export interface NasaItemData {
  nasa_id: string
  title: string
  description?: string
  keywords?: string[]
  location?: string
  photographer?: string
  date_created: string
  media_type: string
  center?: string
}

/** A rendition link of a search item. The thumbnail is the one with `rel: "preview"`. */
export interface NasaItemLink {
  href: string
  rel: string
  render?: string
  width?: number
  height?: number
  size?: number
}

export interface NasaSearchItem {
  href: string
  data: NasaItemData[]
  links?: NasaItemLink[]
}

export interface NasaCollectionLink {
  rel: string
  prompt?: string
  href: string
}

export interface NasaSearchResponse {
  collection: {
    version: string
    href: string
    items: NasaSearchItem[]
    metadata: { total_hits: number }
    links?: NasaCollectionLink[]
  }
}

export interface NasaAssetResponse {
  collection: {
    version: string
    href: string
    items: { href: string }[]
  }
}

// ---------------------------------------------------------------------------
// App models (what the UI consumes)
// ---------------------------------------------------------------------------

export interface SearchCriteria {
  q: string
  yearStart?: string
  yearEnd?: string
}

export interface SearchImagesParams extends SearchCriteria {
  /** 1-based page number. Defaults to 1. */
  page?: number
}

export interface NasaImage {
  nasaId: string
  title: string
  description?: string
  keywords: string[]
  location?: string
  photographer?: string
  dateCreated: string
  thumbnailUrl?: string
}

export interface SearchPage {
  items: NasaImage[]
  totalHits: number
  /** The next page number, or undefined when there is no "next" link. */
  nextPage?: number
}

export const IMAGE_VERSION_LABELS = [
  'orig',
  'large',
  'medium',
  'small',
  'thumb',
] as const

export type ImageVersionLabel = (typeof IMAGE_VERSION_LABELS)[number]

export interface ImageVersion {
  label: ImageVersionLabel
  /** File extension in lower case, e.g. "jpg" or "tif". */
  extension: string
  url: string
}
