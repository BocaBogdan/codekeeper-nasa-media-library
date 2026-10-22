import { createFileRoute } from '@tanstack/react-router'

import { SearchForm } from '@/components/SearchForm'
import { SearchResults } from '@/components/SearchResults'
import {
  searchParamsSchema,
  toFormValues,
  toSearchCriteria,
  toSearchParams,
  type SearchFormValues,
} from '@/lib/search-schema'

export const Route = createFileRoute('/')({
  validateSearch: searchParamsSchema,
  component: SearchPage,
})

function SearchPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  // Invalid or missing params (e.g. a hand-edited URL) never reach the API.
  const criteria = toSearchCriteria(search)

  const handleSubmit = (values: SearchFormValues) => {
    void navigate({ search: toSearchParams(values) })
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">Search images</h1>
        <p className="text-muted-foreground">
          Explore the NASA Image and Video Library.
        </p>
      </div>

      <SearchForm values={toFormValues(search)} onSubmit={handleSubmit} />

      {criteria && <SearchResults criteria={criteria} />}
    </div>
  )
}
