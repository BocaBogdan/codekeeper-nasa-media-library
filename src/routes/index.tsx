import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { searchImages } from '@/api/nasa.ts'
import type { SearchCriteria } from '@/api/types.ts'
import { Skeleton } from '@/components/ui/skeleton.tsx'
import { Card } from '@/components/ui/card.tsx'

export const Route = createFileRoute('/')({
  component: SearchPage,
})

function SearchPage() {
  const criteria: SearchCriteria = {
    q: 'SpaceX',
  }

  const res = useQuery({
    queryKey: ['search', criteria],
    queryFn: () => searchImages({ ...criteria }),
  })

  const { isLoading, isError, data } = res

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-heading text-2xl font-semibold">Search images</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && (
          <Card className="gap-0 py-0">
            <Skeleton className="aspect-4/3 w-full rounded-none" />
            <div className="flex flex-col gap-2 p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </Card>
        )}
        {isError && <p>There was an error</p>}

        {data?.items?.map((item) => (
          <Card key={item.nasaId}>
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="aspect-4/3 w-full object-cover"
            />
            <div className="flex flex-col gap-2 p-4">
              {item.location && (
                <p className='flex justify-between'>
                  <span className='text-gray-500'>Location: </span>
                  <span>{item.location}</span>
                </p>
              )}
              {item.photographer && (
                <p className='flex justify-between'>
                  <span className='text-gray-500'>Photographer: </span>
                  <span>{item.photographer}</span>
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
