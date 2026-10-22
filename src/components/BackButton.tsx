import { useCanGoBack, useRouter } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

/**
 * Goes back in history so the previous search (URL params, cached results and
 * scroll position) is restored. When the page was opened directly there is no
 * history entry to return to, so it navigates to the Search page instead.
 */
export function BackButton() {
  const router = useRouter()
  const canGoBack = useCanGoBack()

  const handleClick = () => {
    if (canGoBack) router.history.back()
    else void router.navigate({ to: '/' })
  }

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className="-ml-2.5 self-start"
    >
      <ArrowLeftIcon aria-hidden="true" />
      Back to search
    </Button>
  )
}
