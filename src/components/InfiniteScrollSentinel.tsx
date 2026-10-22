import { useEffect, useEffectEvent, useRef } from 'react'

interface InfiniteScrollSentinelProps {
  onIntersect: () => void
  /** Stops observing, e.g. while a page is being fetched. */
  disabled?: boolean
}

/**
 * An invisible element that calls `onIntersect` when it scrolls into (or near)
 * the viewport. Placed after the last result to load the next page.
 */
export function InfiniteScrollSentinel({
  onIntersect,
  disabled = false,
}: InfiniteScrollSentinelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const handleIntersect = useEffectEvent(onIntersect)

  useEffect(() => {
    const element = ref.current
    if (!element || disabled) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) handleIntersect()
      },
      // Start loading a bit before the user reaches the end of the list.
      { rootMargin: '0px 0px 400px 0px' },
    )
    observer.observe(element)

    return () => observer.disconnect()
  }, [disabled])

  return <div ref={ref} aria-hidden="true" className="h-px" />
}
