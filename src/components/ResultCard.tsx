import { Link } from '@tanstack/react-router'

import type { NasaImage } from '@/api/types'
import { ImageWithFallback } from '@/components/ImageWithFallback'
import { Card } from '@/components/ui/card'

interface ResultCardProps {
  image: NasaImage
}

export function ResultCard({ image }: ResultCardProps) {
  return (
    <Link
      to="/image/$nasaId"
      params={{ nasaId: image.nasaId }}
      className="block h-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="h-full gap-0 py-0 transition-shadow hover:shadow-md">
        <ImageWithFallback
          src={image.thumbnailUrl}
          alt={image.title}
          className="aspect-4/3 w-full"
        />
        <div className="flex flex-col gap-1 p-4">
          <h2 className="line-clamp-2 font-medium">{image.title}</h2>
          {image.location && (
            <p className="text-muted-foreground">
              <span className="sr-only">Location: </span>
              {image.location}
            </p>
          )}
          {image.photographer && (
            <p className="text-muted-foreground">
              <span className="sr-only">Photographer: </span>
              {image.photographer}
            </p>
          )}
        </div>
      </Card>
    </Link>
  )
}
