import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ratingZh as c } from '../../content/zh/rating'
import { RATING_QUESTION_IDS } from '../../engine/rating'
import { renderApp } from '../../test/renderApp'

describe('业余评级', () => {
  it('el botón no envía hasta responder las 18 preguntas', async () => {
    renderApp('/rating')
    await userEvent.click(screen.getByRole('button', { name: c.submit }))
    expect(screen.getByText(c.incomplete.replace('{n}', '18'))).toBeInTheDocument()
  })
  it('responder todo "c" da L4 y lo guarda', async () => {
    renderApp('/rating')
    const u = userEvent.setup()
    for (const id of RATING_QUESTION_IDS) {
      const group = screen.getByRole('group', { name: c.questions[id].title })
      await u.click(within(group).getByLabelText(c.questions[id].options[2]))
    }
    await u.click(screen.getByRole('button', { name: c.submit }))
    expect(screen.getAllByText(new RegExp(c.levels[4].name)).length).toBeGreaterThan(0)
    expect(JSON.parse(localStorage.getItem('yuqiu.v1')!).rating).toHaveLength(1)
  })
  it('resultado inexistente → vuelve al test con aviso', () => {
    renderApp('/rating/result/nope')
    expect(screen.getByText(c.result.missing)).toBeInTheDocument()
  })
})
