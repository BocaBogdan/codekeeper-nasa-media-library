import { QueryClientProvider } from '@tanstack/react-query'
import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router'
import { render } from '@testing-library/react'

import { createQueryClient } from '@/lib/query-client'
import { parseSearch, stringifySearch } from '@/lib/search-serialization'
import { routeTree } from '@/routeTree.gen'

/** Renders the whole app (real route tree) at the given URL. */
export function renderRoute(url: string) {
  // Same defaults as the app, without retries so error states show at once.
  const queryClient = createQueryClient()
  queryClient.setDefaultOptions({
    queries: { ...queryClient.getDefaultOptions().queries, retry: false },
  })
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [url] }),
    parseSearch,
    stringifySearch,
  })

  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { ...result, router }
}

/** A minimal `Response` for mocking `fetch`. */
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/** The URL a mocked `fetch` was called with. */
export function toRequestUrl(input: Parameters<typeof fetch>[0]): URL {
  return new URL(input instanceof Request ? input.url : input)
}
