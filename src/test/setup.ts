import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Los tests nunca salen a internet (fotos de Wikipedia, etc.): fetch falla salvo que un test lo simule.
vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network disabled in tests'))))

afterEach(() => {
  cleanup()
  localStorage.clear()
})
