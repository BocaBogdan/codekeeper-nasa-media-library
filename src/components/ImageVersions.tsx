import { ExternalLinkIcon } from 'lucide-react'

import type { ImageVersion } from '@/api/types'
import { ImageWithFallback } from '@/components/ImageWithFallback'
import { IMAGE_VERSION_NAMES, pickPreviewVersion } from '@/lib/asset-version'

interface ImageVersionsProps {
  title: string
  versions: ImageVersion[]
}

export function ImageVersions({ title, versions }: ImageVersionsProps) {
  const preview = pickPreviewVersion(versions)

  return (
    <div className="flex flex-col gap-4">
      <ImageWithFallback
        src={preview?.url}
        alt={title}
        className="max-h-[70vh] min-h-48 w-full rounded-xl object-contain"
      />

      <section aria-labelledby="image-versions-heading" className="space-y-2">
        <h2 id="image-versions-heading" className="font-medium">
          Image versions
        </h2>
        {versions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No image versions available.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {versions.map((version) => (
              <li key={version.url}>
                <a
                  href={version.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {IMAGE_VERSION_NAMES[version.label]}
                  <span className="text-muted-foreground uppercase">
                    {version.extension}
                  </span>
                  <ExternalLinkIcon aria-hidden="true" className="size-3.5" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
