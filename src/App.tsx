import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import LoginPage          from '@/pages/LoginPage'
import LandingPage        from '@/pages/LandingPage'
import HomePage           from '@/pages/HomePage'
import EncounterPage      from '@/pages/EncounterPage'
import PresetPage         from '@/pages/PresetPage'
import EncounterViewPage  from '@/pages/EncounterViewPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <FullScreenLoader />
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

// Root: show landing page to guests, home page to logged-in users
function RootRoute() {
  const { user, isLoading } = useAuth()
  if (isLoading) return <FullScreenLoader />
  if (user) return <HomePage />
  return <LandingPage />
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <svg className="w-16 h-16 animate-spin text-dnd-jade" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p className="font-body text-dnd-jade text-lg tracking-widest">Loading…</p>
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/"      element={<RootRoute />} />
      <Route path="/encounters/:id"      element={<ProtectedRoute><EncounterPage /></ProtectedRoute>} />
      <Route path="/encounters/:id/view" element={<ProtectedRoute><EncounterViewPage /></ProtectedRoute>} />
      <Route path="/presets/:id"         element={<ProtectedRoute><PresetPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#102B38',
                color: '#D0EEE8',
                border: '1px solid #1A4055',
                fontFamily: '"Cinzel", Georgia, serif',
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
