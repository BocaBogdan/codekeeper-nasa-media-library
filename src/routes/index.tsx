import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: SearchPage,
})

function SearchPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-heading text-2xl font-semibold">Search images</h1>
      <p className="text-muted-foreground">Search page coming soon.</p>
    </div>
  )
}
