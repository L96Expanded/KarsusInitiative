import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, LogOut, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface LayoutProps {
  children: ReactNode
  title?: string
}

export default function Layout({ children, title }: LayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Farewell, adventurer!')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-adventure bg-dragon-scale flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-dnd-black/80 backdrop-blur-md border-b border-dnd-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-sm bg-dnd-gold/10 border border-dnd-gold/40 flex items-center justify-center group-hover:bg-dnd-gold/20 group-hover:border-dnd-gold transition-all">
              <Shield className="w-4 h-4 text-dnd-gold" />
            </div>
            <div className="leading-tight">
              <span className="font-display text-dnd-gold text-sm tracking-widest">KARSUS</span>
              <span className="block font-body text-dnd-muted text-[10px] tracking-[0.25em]">INITIATIVE</span>
            </div>
          </button>

          {/* Page title */}
          {title && (
            <h1 className="hidden sm:block font-body text-dnd-amber/70 text-xs tracking-[0.3em] uppercase">
              {title}
            </h1>
          )}

          {/* User menu */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-dnd-muted text-sm font-ui">
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:block text-xs tracking-widest">{user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-2 rounded text-dnd-muted hover:text-dnd-red hover:bg-dnd-surface/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-3 text-center text-dnd-muted/30 text-xs font-ui border-t border-dnd-border/20">
        ⚔ Karsus Initiative Tracker ⚔
      </footer>
    </div>
  )
}
