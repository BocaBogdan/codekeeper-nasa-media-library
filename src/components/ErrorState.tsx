import { CircleAlertIcon, RotateCwIcon } from 'lucide-react'

import { NasaApiError } from '@/api/nasa'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title: string
  error: unknown
  onRetry: () => void
}

export function ErrorState({ title, error, onRetry }: ErrorStateProps) {
  const detail =
    error instanceof NasaApiError
      ? `The NASA API responded with HTTP status ${error.status}.`
      : 'Please check your connection and try again.'

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center"
    >
      <CircleAlertIcon aria-hidden="true" className="size-6 text-destructive" />
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </div>
      <Button variant="outline" onClick={onRetry}>
        <RotateCwIcon aria-hidden="true" />
        Retry
      </Button>
    </div>
  )
}
