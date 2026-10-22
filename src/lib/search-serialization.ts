/**
 * Plain-string search param (de)serialisation for the router.
 *
 * TanStack Router's default serializer JSON-encodes values, so a year such as
 * "1969" would end up in the URL as `yearStart=%221969%22` and be parsed back
 * as a number. All of this app's search params are strings, so they are kept
 * as plain strings: `?q=apollo&yearStart=1969`.
 */
export function parseSearch(searchStr: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(searchStr))
}

export function stringifySearch(search: Record<string, unknown>): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(search)) {
    if (value === undefined || value === null || value === '') continue
    params.set(key, typeof value === 'string' ? value : JSON.stringify(value))
  }

  const searchStr = params.toString()
  return searchStr ? `?${searchStr}` : ''
}
