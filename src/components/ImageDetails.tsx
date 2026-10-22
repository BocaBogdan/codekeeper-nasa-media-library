import type { ReactNode } from 'react'

import type { NasaImage } from '@/api/types'
import { formatDate } from '@/lib/format-date'
import { stripHtml } from '@/lib/strip-html'

interface ImageDetailsProps {
  image: NasaImage
}

const NOT_AVAILABLE = (
  <span className="text-muted-foreground">Not available</span>
)

export function ImageDetails({ image }: ImageDetailsProps) {
  const description = image.description ? stripHtml(image.description) : ''

  return (
    <div className="flex flex-col gap-6">
      <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <DetailItem label="Location">
          {image.location || NOT_AVAILABLE}
        </DetailItem>
        <DetailItem label="Photographer">
          {image.photographer || NOT_AVAILABLE}
        </DetailItem>
        <DetailItem label="Date">
          <time dateTime={image.dateCreated}>
            {formatDate(image.dateCreated)}
          </time>
        </DetailItem>
        <DetailItem label="Keywords">
          {image.keywords.length > 0 ? (
            <ul aria-label="Keywords" className="flex flex-wrap gap-1.5">
              {image.keywords.map((keyword, index) => (
                <li
                  key={`${index}-${keyword}`}
                  className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                >
                  {keyword}
                </li>
              ))}
            </ul>
          ) : (
            NOT_AVAILABLE
          )}
        </DetailItem>
      </dl>

      <section aria-labelledby="description-heading" className="space-y-2">
        <h2 id="description-heading" className="font-medium">
          Description
        </h2>
        {/* Rendered as text, never as HTML. */}
        <p className="text-sm leading-relaxed break-words whitespace-pre-line">
          {description || NOT_AVAILABLE}
        </p>
      </section>
    </div>
  )
}

function DetailItem({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <dt className="mb-1 font-medium text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}
