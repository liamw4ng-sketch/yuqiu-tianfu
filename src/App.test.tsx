import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import App from './App'

it('muestra las 5 pestañas en chino y cambia a español', async () => {
  render(<App />)
  for (const label of ['首页', '天赋测评', '业余评级', '羽球MBTI', '我的档案']) {
    expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
  }
  await userEvent.click(screen.getByRole('button', { name: '切换到西班牙语' }))
  expect(screen.getByRole('link', { name: 'Test de talento' })).toBeInTheDocument()
  expect(document.documentElement.lang).toBe('es')
})

it('recuerda el idioma elegido al volver a abrir la app', async () => {
  const first = render(<App />)
  await userEvent.click(screen.getByRole('button', { name: '切换到西班牙语' }))
  first.unmount()
  render(<App />)
  expect(screen.getByRole('link', { name: 'Test de talento' })).toBeInTheDocument()
})
