import { screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { renderApp } from '../test/renderApp'

it('portada con los tres módulos enlazados', () => {
  renderApp('/')
  expect(screen.getByRole('link', { name: /体型 \+ 六维能力/ })).toHaveAttribute('href', '/talent')
  expect(screen.getByRole('link', { name: /18 道可观察/ })).toHaveAttribute('href', '/rating')
  expect(screen.getByRole('link', { name: /20 个球场情景/ })).toHaveAttribute('href', '/mbti')
})
