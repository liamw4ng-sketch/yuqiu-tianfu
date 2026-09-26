import { act, render } from '@testing-library/react'
import { expect, it } from 'vitest'
import { GOLDEN } from '../engine/testkit'
import { STORAGE_KEY } from './storage'
import { StoreProvider, useStore } from './StoreProvider'

it('addTalent guarda en localStorage y devuelve el registro', () => {
  // Objeto contenedor: TypeScript no estrecha `ref.current` a null como haría con un `let`.
  const ref: { current: ReturnType<typeof useStore> | null } = { current: null }
  function Probe() {
    ref.current = useStore()
    return null
  }
  render(
    <StoreProvider>
      <Probe />
    </StoreProvider>,
  )
  let id = ''
  act(() => {
    id = ref.current!.addTalent(GOLDEN).id
  })
  expect(ref.current!.state.talent.map((r) => r.id)).toEqual([id])
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).talent[0].input.heightCm).toBe(163)
  act(() => ref.current!.clearAll())
  expect(ref.current!.state.talent).toEqual([])
})
