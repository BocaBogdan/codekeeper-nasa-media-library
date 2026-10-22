import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SearchForm } from '@/components/SearchForm'

const emptyValues = { q: '', yearStart: '', yearEnd: '' }

function setup(values = emptyValues) {
  const onSubmit = vi.fn()
  const user = userEvent.setup()
  render(<SearchForm values={values} onSubmit={onSubmit} />)
  return { onSubmit, user }
}

describe('SearchForm', () => {
  it('shows an error and does not submit without a query', async () => {
    const { onSubmit, user } = setup()

    await user.type(screen.getByLabelText('Query'), '   ')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(await screen.findByText('Enter a search term')).toBeInTheDocument()
    expect(screen.getByLabelText('Query')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('validates the year format and range', async () => {
    const { onSubmit, user } = setup()

    await user.type(screen.getByLabelText('Query'), 'apollo')
    await user.type(screen.getByLabelText('Year Start'), '69')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(
      await screen.findByText('Enter a 4-digit year (YYYY)'),
    ).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Year Start'))
    await user.type(screen.getByLabelText('Year Start'), '1972')
    await user.type(screen.getByLabelText('Year End'), '1969')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(
      await screen.findByText(
        'Year End must be the same as or later than Year Start',
      ),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits trimmed valid values', async () => {
    const { onSubmit, user } = setup()

    await user.type(screen.getByLabelText('Query'), '  apollo 11 ')
    await user.type(screen.getByLabelText('Year Start'), '1969')
    await user.type(screen.getByLabelText('Year End'), '1972')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0]).toEqual({
      q: 'apollo 11',
      yearStart: '1969',
      yearEnd: '1972',
    })
  })

  it('is pre-filled with the given values', () => {
    setup({ q: 'mars', yearStart: '2000', yearEnd: '' })

    expect(screen.getByLabelText('Query')).toHaveValue('mars')
    expect(screen.getByLabelText('Year Start')).toHaveValue('2000')
    expect(screen.getByLabelText('Year End')).toHaveValue('')
  })
})
