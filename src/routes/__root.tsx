import { Link, Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  return (
    <div className="min-h-svh">
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6">
          <Link to="/" className="font-heading text-lg font-semibold">
            NASA Media Library
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}

function NotFound() {
  return (
    <div className="py-12 text-center">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <Link to="/" className="mt-4 inline-block underline underline-offset-4">
        Go to search
      </Link>
    </div>
  )
}
