import { useInfiniteQuery } from '@tanstack/react-query'
import { LoaderCircleIcon } from 'lucide-react'
import { useMemo } from 'react'

import { searchImages } from '@/api/nasa'
import type { NasaImage, SearchCriteria } from '@/api/types'
import { ErrorState } from '@/components/ErrorState'
import { InfiniteScrollSentinel } from '@/components/InfiniteScrollSentinel'
import { ResultsGrid, ResultsGridSkeleton } from '@/components/ResultsGrid'

interface SearchResultsProps {
  criteria: SearchCriteria
}

export function SearchResults({ criteria }: SearchResultsProps) {
  const query = useInfiniteQuery({
    queryKey: ['search', criteria],
    queryFn: ({ pageParam, signal }) =>
      searchImages({ ...criteria, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })

  const images = useMemo(() => {
    // Pages can overlap when the index changes between requests; keep ids unique.
    const byId = new Map<string, NasaImage>()
    for (const page of query.data?.pages ?? []) {
      for (const image of page.items) {
        if (!byId.has(image.nasaId)) byId.set(image.nasaId, image)
      }
    }
    return [...byId.values()]
  }, [query.data])

  if (query.isPending) return <ResultsGridSkeleton />

  if (query.isError && !query.data) {
    return (
      <ErrorState
        title="Something went wrong while searching."
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    )
  }

  if (images.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No results found for “{criteria.q}”. Try another search term or a
        different year range.
      </p>
    )
  }

  return (
    <section aria-label="Results" className="flex flex-col gap-6">
      <ResultsGrid images={images} />

      {query.isFetchNextPageError ? (
        <ErrorState
          title="Could not load more results."
          error={query.error}
          onRetry={() => void query.fetchNextPage()}
        />
      ) : query.hasNextPage ? (
        <>
          <InfiniteScrollSentinel
            onIntersect={() => void query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
          />
          {query.isFetchingNextPage && (
            <p
              role="status"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
            >
              <LoaderCircleIcon
                aria-hidden="true"
                className="size-4 animate-spin"
              />
              Loading more results…
            </p>
          )}
        </>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          You’ve reached the end of the results ({images.length}{' '}
          {images.length === 1 ? 'image' : 'images'}).
        </p>
      )}
    </section>
  )
}
