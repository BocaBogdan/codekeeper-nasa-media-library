import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { getImageAssets, getImageDetails } from '@/api/nasa'
import { BackButton } from '@/components/BackButton'
import { ErrorState } from '@/components/ErrorState'
import { ImageDetails } from '@/components/ImageDetails'
import { ImageVersions } from '@/components/ImageVersions'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/image/$nasaId')({
  component: ImageDetailsPage,
})

function ImageDetailsPage() {
  const { nasaId } = Route.useParams()

  // Two independent queries: item metadata (via search) and the asset manifest.
  const detailsQuery = useQuery({
    queryKey: ['image', nasaId],
    queryFn: ({ signal }) => getImageDetails(nasaId, signal),
  })
  const assetsQuery = useQuery({
    queryKey: ['assets', nasaId],
    queryFn: ({ signal }) => getImageAssets(nasaId, signal),
  })

  return (
    <div className="flex flex-col gap-6">
      <BackButton />
      {detailsQuery.isPending ? (
        <DetailsSkeleton />
      ) : detailsQuery.isError ? (
        <ErrorState
          title="Could not load this image."
          error={detailsQuery.error}
          onRetry={() => void detailsQuery.refetch()}
        />
      ) : detailsQuery.data === null ? (
        <ImageNotFound nasaId={nasaId} />
      ) : (
        <article className="flex flex-col gap-6">
          <h1 className="font-heading text-2xl font-semibold break-words">
            {detailsQuery.data.title}
          </h1>
          <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
            {assetsQuery.isPending ? (
              <Skeleton
                role="status"
                aria-label="Loading image versions"
                className="aspect-4/3 w-full rounded-xl"
              />
            ) : assetsQuery.isError ? (
              <ErrorState
                title="Could not load the image versions."
                error={assetsQuery.error}
                onRetry={() => void assetsQuery.refetch()}
              />
            ) : (
              <ImageVersions
                title={detailsQuery.data.title}
                versions={assetsQuery.data}
              />
            )}
            <ImageDetails image={detailsQuery.data} />
          </div>
        </article>
      )}
    </div>
  )
}

function ImageNotFound({ nasaId }: { nasaId: string }) {
  return (
    <div className="py-12 text-center">
      <h1 className="text-xl font-semibold">Image not found</h1>
      <p className="mt-2 break-words text-muted-foreground">
        There is no image with the id “{nasaId}”.
      </p>
      <Link to="/" className="mt-4 inline-block underline underline-offset-4">
        Go to search
      </Link>
    </div>
  )
}

function DetailsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading image"
      className="flex flex-col gap-6"
    >
      <Skeleton className="h-8 w-2/3" />
      <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
        <Skeleton className="aspect-4/3 w-full rounded-xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  )
}
