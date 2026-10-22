import type { NasaImage } from '@/api/types'
import { ResultCard } from '@/components/ResultCard'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const GRID_CLASSES =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

interface ResultsGridProps {
  images: NasaImage[]
}

export function ResultsGrid({ images }: ResultsGridProps) {
  return (
    <ul aria-label="Search results" className={GRID_CLASSES}>
      {images.map((image) => (
        <li key={image.nasaId}>
          <ResultCard image={image} />
        </li>
      ))}
    </ul>
  )
}

export function ResultsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading results" className={GRID_CLASSES}>
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className="gap-0 py-0">
          <Skeleton className="aspect-4/3 w-full rounded-none" />
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Card>
      ))}
    </div>
  )
}
