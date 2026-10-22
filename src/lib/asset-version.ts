import {
  IMAGE_VERSION_LABELS,
  type ImageVersion,
  type ImageVersionLabel,
} from '@/api/types'
import { toHttps } from '@/lib/to-https'

const VERSION_PATTERN = new RegExp(
  `~(${IMAGE_VERSION_LABELS.join('|')})\\.([a-z0-9]+)$`,
  'i',
)

/** Extensions that browsers can render in an <img>. */
const DISPLAYABLE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp'])

/** Preference order for the main preview image on the Details page. */
const PREVIEW_PREFERENCE: ImageVersionLabel[] = [
  'large',
  'medium',
  'small',
  'orig',
  'thumb',
]

export const IMAGE_VERSION_NAMES: Record<ImageVersionLabel, string> = {
  orig: 'Original',
  large: 'Large',
  medium: 'Medium',
  small: 'Small',
  thumb: 'Thumbnail',
}

/**
 * Parses the version label and extension from an asset href such as
 * `.../PIA12345~large.jpg`. Returns `null` for anything else
 * (e.g. `metadata.json`).
 */
export function parseAssetVersion(
  href: string,
): Pick<ImageVersion, 'label' | 'extension'> | null {
  const path = href.split(/[?#]/)[0]
  const match = VERSION_PATTERN.exec(path)
  if (!match) return null

  return {
    label: match[1].toLowerCase() as ImageVersionLabel,
    extension: match[2].toLowerCase(),
  }
}

/**
 * Turns the hrefs of an asset manifest into image versions, dropping
 * non-image entries and ordering them orig → large → medium → small → thumb.
 */
export function toImageVersions(hrefs: string[]): ImageVersion[] {
  const versions: ImageVersion[] = []

  for (const href of hrefs) {
    const parsed = parseAssetVersion(href)
    if (parsed) versions.push({ ...parsed, url: toHttps(href) })
  }

  return versions.sort(
    (a, b) =>
      IMAGE_VERSION_LABELS.indexOf(a.label) -
      IMAGE_VERSION_LABELS.indexOf(b.label),
  )
}

/**
 * Picks the version to show as the main preview: large first, then medium,
 * then whatever else is available, skipping formats browsers cannot display.
 */
export function pickPreviewVersion(
  versions: ImageVersion[],
): ImageVersion | undefined {
  for (const label of PREVIEW_PREFERENCE) {
    const version = versions.find(
      (v) => v.label === label && DISPLAYABLE_EXTENSIONS.has(v.extension),
    )
    if (version) return version
  }
  return undefined
}
