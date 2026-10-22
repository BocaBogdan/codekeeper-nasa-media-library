import { z } from 'zod'

import type { SearchCriteria } from '@/api/types'

const YEAR_PATTERN = /^\d{4}$/

const optionalYear = z
  .string()
  .trim()
  .refine((value) => value === '' || YEAR_PATTERN.test(value), {
    message: 'Enter a 4-digit year (YYYY)',
  })

/** Validation for the search form. Empty years are represented as ''. */
export const searchFormSchema = z
  .object({
    q: z.string().trim().min(1, 'Enter a search term'),
    yearStart: optionalYear,
    yearEnd: optionalYear,
  })
  .refine(
    ({ yearStart, yearEnd }) =>
      !yearStart || !yearEnd || Number(yearStart) <= Number(yearEnd),
    {
      message: 'Year End must be the same as or later than Year Start',
      path: ['yearEnd'],
    },
  )

export type SearchFormValues = z.infer<typeof searchFormSchema>

/**
 * URL search params of the Search page. Values that are not strings are
 * dropped; the content itself is validated by `toSearchCriteria`.
 */
export const searchParamsSchema = z.object({
  q: z.string().optional().catch(undefined),
  yearStart: z.string().optional().catch(undefined),
  yearEnd: z.string().optional().catch(undefined),
})

export type SearchParams = z.infer<typeof searchParamsSchema>

export function toFormValues(params: SearchParams): SearchFormValues {
  return {
    q: params.q ?? '',
    yearStart: params.yearStart ?? '',
    yearEnd: params.yearEnd ?? '',
  }
}

/** Maps submitted form values to URL search params, omitting empty years. */
export function toSearchParams(values: SearchFormValues): SearchParams {
  return {
    q: values.q,
    yearStart: values.yearStart || undefined,
    yearEnd: values.yearEnd || undefined,
  }
}

/**
 * Returns the API search criteria for the given URL params, or `null` when
 * they do not pass the form validation (so no request is sent).
 */
export function toSearchCriteria(params: SearchParams): SearchCriteria | null {
  const result = searchFormSchema.safeParse(toFormValues(params))
  if (!result.success) return null

  const { q, yearStart, yearEnd } = result.data
  return {
    q,
    yearStart: yearStart || undefined,
    yearEnd: yearEnd || undefined,
  }
}
