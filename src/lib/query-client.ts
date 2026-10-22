import { QueryClient } from '@tanstack/react-query'

import { NasaApiError } from '@/api/nasa'

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Serve cached results instantly when navigating Back to the search.
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        // Client errors (4xx) will not succeed on retry.
        retry: (failureCount, error) =>
          !(error instanceof NasaApiError && error.status < 500) &&
          failureCount < 2,
      },
    },
  })
}
