import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { mbtiZh as c } from '../../content/zh/mbti'
import { MBTI_QUESTION_IDS } from '../../engine/mbti'
import { renderApp } from '../../test/renderApp'

describe('羽球MBTI', () => {
  it('responder todo "a" da ESTJ, muestra pareja ideal y lo guarda', async () => {
    renderApp('/mbti')
    const u = userEvent.setup()
    for (const id of MBTI_QUESTION_IDS) {
      const group = screen.getByRole('group', { name: c.questions[id].text })
      await u.click(within(group).getByLabelText(c.questions[id].a))
    }
    await u.click(screen.getByRole('button', { name: c.submit }))
    expect(screen.getAllByText(new RegExp(c.types.ESTJ.nickname)).length).toBeGreaterThan(0)
    expect(screen.getAllByText(new RegExp(c.types.ISTP.nickname)).length).toBeGreaterThan(0)
    expect(screen.getAllByText(c.disclaimer).length).toBeGreaterThan(0)
    expect(JSON.parse(localStorage.getItem('yuqiu.v1')!).mbti).toHaveLength(1)
  })
  it('resultado inexistente → vuelve al test con aviso', () => {
    renderApp('/mbti/result/nope')
    expect(screen.getByText(c.result.missing)).toBeInTheDocument()
  })
})
