import { zodResolver } from '@hookform/resolvers/zod'
import { SearchIcon } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { searchFormSchema, type SearchFormValues } from '@/lib/search-schema'

interface SearchFormProps {
  /** Current values (from the URL). The form resets when they change. */
  values: SearchFormValues
  onSubmit: (values: SearchFormValues) => void
}

const YEAR_FIELDS = [
  { name: 'yearStart', label: 'Year Start', placeholder: 'e.g. 1969' },
  { name: 'yearEnd', label: 'Year End', placeholder: 'e.g. 1972' },
] as const

export function SearchForm({ values, onSubmit }: SearchFormProps) {
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    values,
  })

  return (
    <form
      role="search"
      noValidate
      onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
      className="grid grid-cols-2 gap-4 sm:grid-cols-[minmax(0,1fr)_8rem_8rem_auto] sm:items-start"
    >
      <Controller
        name="q"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field
            data-invalid={fieldState.invalid}
            className="col-span-2 sm:col-span-1"
          >
            <FieldLabel htmlFor="search-q">Query</FieldLabel>
            <Input
              {...field}
              id="search-q"
              type="search"
              placeholder="e.g. Apollo 11"
              aria-invalid={fieldState.invalid}
              aria-describedby={fieldState.error ? 'search-q-error' : undefined}
            />
            <FieldError id="search-q-error" errors={[fieldState.error]} />
          </Field>
        )}
      />

      {YEAR_FIELDS.map(({ name, label, placeholder }) => (
        <Controller
          key={name}
          name={name}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`search-${name}`}>{label}</FieldLabel>
              <Input
                {...field}
                id={`search-${name}`}
                inputMode="numeric"
                maxLength={4}
                placeholder={placeholder}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.error ? `search-${name}-error` : undefined
                }
              />
              <FieldError
                id={`search-${name}-error`}
                errors={[fieldState.error]}
              />
            </Field>
          )}
        />
      ))}

      {/* On one row, offset the button by the label height + gap to line up with the inputs. */}
      <Button
        type="submit"
        className="col-span-2 sm:col-span-1 sm:mt-[calc(var(--text-sm)*var(--leading-snug)+var(--spacing)*3)]"
      >
        <SearchIcon aria-hidden="true" />
        Search
      </Button>
    </form>
  )
}
