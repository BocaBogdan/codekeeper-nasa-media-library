import { ImageOffIcon } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

interface ImageWithFallbackProps {
  src?: string
  alt: string
  className?: string
}

/** Renders the image, or a placeholder when `src` is missing or fails to load. */
export function ImageWithFallback({
  src,
  alt,
  className,
}: ImageWithFallbackProps) {
  const [failedSrc, setFailedSrc] = useState<string>()

  if (!src || failedSrc === src) {
    return (
      <div
        role="img"
        aria-label={`${alt} (image not available)`}
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className,
        )}
      >
        <ImageOffIcon aria-hidden="true" className="size-8" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(src)}
      className={cn('bg-muted object-cover', className)}
    />
  )
}
