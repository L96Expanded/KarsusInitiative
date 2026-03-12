import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '@/pages/LoginPage'
import { AuthContext } from '@/contexts/AuthContext'
import type { ReactNode } from 'react'

// Minimal auth context value for tests
function makeAuthContext(overrides: Partial<{
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
}> = {}) {
  return {
    user: null,
    token: null,
    isLoading: false,
    logout: vi.fn(),
    login: vi.fn().mockResolvedValue(undefined),
    register: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

function Wrapper({ children, ctx }: { children: ReactNode; ctx: ReturnType<typeof makeAuthContext> }) {
  return (
    <MemoryRouter>
      <AuthContext.Provider value={ctx}>
        {children}
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the login form', () => {
    render(<LoginPage />, { wrapper: ({ children }) => <Wrapper ctx={makeAuthContext()}>{children}</Wrapper> })
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enter the realm/i })).toBeInTheDocument()
  })

  it('shows validation error for empty email', async () => {
    const user = userEvent.setup()
    render(<LoginPage />, { wrapper: ({ children }) => <Wrapper ctx={makeAuthContext()}>{children}</Wrapper> })

    await user.click(screen.getByRole('button', { name: /enter the realm/i }))
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument()
  })

  it('shows validation error for short password', async () => {
    const user = userEvent.setup()
    render(<LoginPage />, { wrapper: ({ children }) => <Wrapper ctx={makeAuthContext()}>{children}</Wrapper> })

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'a@b.com')
    await user.type(screen.getByLabelText(/password/i), '123')
    await user.click(screen.getByRole('button', { name: /enter the realm/i }))
    expect(await screen.findByText(/at least 6/i)).toBeInTheDocument()
  })

  it('calls login with correct credentials', async () => {
    const loginMock = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<LoginPage />, { wrapper: ({ children }) => <Wrapper ctx={makeAuthContext({ login: loginMock })}>{children}</Wrapper> })

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /enter the realm/i }))

    expect(loginMock).toHaveBeenCalledWith('test@example.com', 'password123')
  })
})
