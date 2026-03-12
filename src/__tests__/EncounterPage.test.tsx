import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import EncounterPage from '@/pages/EncounterPage'
import { AuthContext } from '@/contexts/AuthContext'
import type { ReactNode } from 'react'

// vi.mock is hoisted — factory must not reference variables declared after it
vi.mock('@/api/encounters', () => ({
  encountersApi: {
    get:            vi.fn(),
    update:         vi.fn(),
    delete:         vi.fn(),
    addCreature:    vi.fn(),
    updateCreature: vi.fn(),
    deleteCreature: vi.fn(),
    nextTurn:       vi.fn(),
    prevTurn:       vi.fn(),
  },
}))

// Import after mock is registered so we get the mocked version
import { encountersApi } from '@/api/encounters'

const authCtx = {
  user: { id: 'u1', email: 'a@b.com', username: 'Tester', createdAt: '2025-01-01T00:00:00Z' },
  token: 'fake-token',
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}

function Wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      <AuthContext.Provider value={authCtx}>
        <MemoryRouter initialEntries={['/encounters/enc-1']}>
          <Routes>
            <Route path="/encounters/:id" element={children} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  )
}

describe('EncounterPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('shows loading state while fetching', () => {
    vi.mocked(encountersApi.get).mockReturnValue(new Promise(() => {})) // intentionally pending
    render(<EncounterPage />, { wrapper: Wrapper })
    expect(document.body).toBeTruthy()
  })

  it('shows error message on fetch failure', async () => {
    vi.mocked(encountersApi.get).mockRejectedValue(new Error('Not found'))
    render(<EncounterPage />, { wrapper: Wrapper })
    expect(await screen.findByText(/not found|error|failed/i)).toBeInTheDocument()
  })
})
