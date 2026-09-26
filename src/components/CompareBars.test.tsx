import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { CompareBars } from './CompareBars'

it('muestra — cuando falta un dato y nunca NaN', () => {
  render(
    <CompareBars
      youLabel="你"
      themLabel="镜"
      rows={[
        { label: '身高', you: 163, them: 163, unit: 'cm' },
        { label: '体重', you: 51, them: null, unit: 'kg' },
        { label: 'BMI', you: 19.2, them: null, digits: 1 },
      ]}
    />,
  )
  expect(screen.getAllByText('—')).toHaveLength(2)
  expect(document.body.textContent).not.toContain('NaN')
  expect(screen.getByText('19.2')).toBeInTheDocument()
})
