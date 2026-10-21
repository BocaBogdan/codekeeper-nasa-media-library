import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/image/$nasaId')({
  component: ImageDetailsPage,
})

function ImageDetailsPage() {
  const { nasaId } = Route.useParams()

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-heading text-2xl font-semibold">Image details</h1>
      <p className="wrap-break-word text-muted-foreground">
        Details for “{nasaId}” coming soon.
      </p>
      <Link to="/" className="underline underline-offset-4">
        Back to search
      </Link>
    </div>
  )
}
