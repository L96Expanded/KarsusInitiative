import { type ReactNode, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, LogOut, User, Palette, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

type ThemeId = 'teal' | 'black' | 'white' | 'red' | 'yellow' | 'green' | 'orange' | 'purple'

const THEMES: { id: ThemeId; label: string; color: string }[] = [
  { id: 'teal',   label: 'Teal',   color: '#2DD4BF' },
  { id: 'black',  label: 'Black',  color: '#9CA3AF' },
  { id: 'white',  label: 'White',  color: '#E2E8F0' },
  { id: 'red',    label: 'Red',    color: '#EF4444' },
  { id: 'yellow', label: 'Yellow', color: '#FBBF24' },
  { id: 'green',  label: 'Green',  color: '#34D399' },
  { id: 'orange', label: 'Orange', color: '#FB923C' },
  { id: 'purple', label: 'Purple', color: '#A78BFA' },
]

interface LayoutProps {
  children: ReactNode
  title?: string
}

export default function Layout({ children, title }: LayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState<ThemeId>(
    () => (localStorage.getItem('theme') as ThemeId) ?? 'teal'
  )
  const menuRef = useRef<HTMLDivElement>(null)

  // Apply theme to <html> element whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    toast.success('Farewell, adventurer!')
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 dnd-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 group"
          >
            <div
              className="w-8 h-8 rounded-sm border flex items-center justify-center transition-all"
              style={{
                backgroundColor: 'rgba(var(--theme-primary-rgb), 0.22)',
                borderColor:     'rgba(var(--theme-accent-rgb), 0.5)',
              }}
            >
              <Shield className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
            </div>
            <div className="leading-tight">
              <span className="font-display text-sm tracking-widest" style={{ color: 'var(--theme-accent)' }}>
                KARSUS
              </span>
              <span className="block font-body text-dnd-muted text-[10px] tracking-[0.25em]">INITIATIVE</span>
            </div>
          </button>

          {/* Page title */}
          {title && (
            <h1
              className="hidden sm:block font-body text-xs tracking-[0.3em] uppercase"
              style={{ color: 'rgba(var(--theme-accent-rgb), 0.6)' }}
            >
              {title}
            </h1>
          )}

          {/* User account dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 text-sm font-ui transition-colors px-2 py-1.5 rounded-lg hover:bg-dnd-surface/60"
              style={{ color: 'var(--theme-accent)' }}
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:block text-xs tracking-widest">{user?.username}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 dnd-card py-2 z-50">
                {/* Theme picker */}
                <div className="px-3 py-1.5">
                  <p className="text-dnd-muted text-[10px] font-body tracking-[0.2em] uppercase mb-2 flex items-center gap-1.5">
                    <Palette className="w-3 h-3" /> Color Theme
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {THEMES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { setTheme(t.id); setMenuOpen(false) }}
                        title={t.label}
                        className="w-full aspect-square rounded-md border-2 transition-all hover:scale-110 flex items-center justify-center"
                        style={{
                          backgroundColor: t.color + '22',
                          borderColor: theme === t.id ? t.color : 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <span
                          className="block w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: t.color }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-dnd-border/50 mt-2 pt-1 px-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-dnd-muted hover:text-dnd-red hover:bg-dnd-surface/60 transition-colors text-sm font-ui"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
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
