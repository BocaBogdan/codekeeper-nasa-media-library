import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { createQueryClient } from '@/lib/query-client'
import { parseSearch, stringifySearch } from '@/lib/search-serialization'
import { routeTree } from '@/routeTree.gen'

import './index.css'

const queryClient = createQueryClient()

const router = createRouter({
  routeTree,
  parseSearch,
  stringifySearch,
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
