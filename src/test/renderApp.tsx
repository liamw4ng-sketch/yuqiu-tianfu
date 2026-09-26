import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes, LangBridge } from '../App'
import { StoreProvider } from '../lib/StoreProvider'

export function renderApp(path: string) {
  return render(
    <StoreProvider>
      <LangBridge>
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>
      </LangBridge>
    </StoreProvider>,
  )
}
