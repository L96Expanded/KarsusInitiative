import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Sword, ChevronRight } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  // Always render landing page with teal theme, regardless of user's theme setting
  useEffect(() => {
    const html = document.documentElement
    const prev = html.getAttribute('data-theme')
    html.setAttribute('data-theme', 'teal')
    return () => { html.setAttribute('data-theme', prev ?? 'teal') }
  }, [])

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* ── Background image ───────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg-city.jpg"
          alt=""
          className="w-full h-full object-cover object-center"
        />
        {/* Dark overlay — lighter at the top so the navbar text is readable,
            heavier toward the bottom to anchor the hero copy */}
        <div className="absolute inset-0 bg-gradient-to-b from-dnd-black/60 via-dnd-black/45 to-dnd-black/85" />
        {/* Left-edge jade glow — gives energy to the horizon */}
        <div className="absolute inset-0 bg-gradient-to-r from-dnd-teal/10 via-transparent to-transparent" />
      </div>

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-sm flex items-center justify-center backdrop-blur-sm"
            style={{
              backgroundColor: 'rgb(var(--theme-primary-rgb) / 0.22)',
              border: '1px solid rgb(var(--theme-accent-rgb) / 0.55)',
            }}
          >
            <Shield className="w-5 h-5" style={{ color: 'var(--theme-accent)' }} />
          </div>
          <div className="leading-tight">
            <span className="font-display text-base tracking-widest" style={{ color: 'var(--theme-accent)' }}>KARSUS</span>
            <span className="block font-body text-dnd-muted text-[10px] tracking-[0.3em]">INITIATIVE</span>
          </div>
        </div>

        {/* Auth buttons — always teal, never affected by theme picker */}
        <div
          className="flex items-center gap-3"
          style={{
            '--theme-primary':     '#0D9488',
            '--theme-primary-rgb': '13, 148, 136',
            '--theme-accent':      '#2DD4BF',
            '--theme-accent-rgb':  '45, 212, 191',
          } as React.CSSProperties}
        >
          <button
            onClick={() => navigate('/login')}
            className="dnd-button-ghost text-sm py-2 px-5"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/login', { state: { mode: 'register' } })}
            className="dnd-button-primary text-sm py-2 px-5"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-20 gap-7">
        {/* Eyebrow */}
        <div className="flex items-center gap-2.5 text-dnd-jade font-body text-xs tracking-[0.4em] uppercase">
          <Sword className="w-3.5 h-3.5" />
          <span>Initiative Tracker</span>
          <Sword className="w-3.5 h-3.5 rotate-180" />
        </div>

        {/* Headline */}
        <div>
          <h1 className="font-display text-7xl sm:text-8xl text-dnd-parchment tracking-widest leading-none drop-shadow-2xl">
            KARSUS
          </h1>
          <div className="mt-2 flex items-center justify-center gap-3">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-dnd-jade/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-dnd-jade" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-dnd-jade/60" />
          </div>
        </div>

        {/* Tagline */}
        <p className="max-w-xl text-dnd-parchment/80 font-ui text-lg leading-relaxed">
          Command the battlefield. Track every turn.<br />
          Share the chaos — in real time, across any device.
        </p>

        {/* CTA — always teal */}
        <div
          className="flex items-center gap-4 mt-2"
          style={{
            '--theme-primary':     '#0D9488',
            '--theme-primary-rgb': '13, 148, 136',
            '--theme-accent':      '#2DD4BF',
            '--theme-accent-rgb':  '45, 212, 191',
          } as React.CSSProperties}
        >
          <button
            onClick={() => navigate('/login', { state: { mode: 'register' } })}
            className="dnd-button-primary flex items-center gap-2 text-base py-3 px-8 shadow-glow-teal"
          >
            Begin Your Legend <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="dnd-button-secondary text-base py-3 px-8"
          >
            Sign In
          </button>
        </div>

        {/* Flavour quote */}
        <p className="text-dnd-muted/60 font-ui italic text-sm mt-4">
          "Roll for initiative."
        </p>
      </main>

      {/* ── Bottom feature strip ────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-dnd-border/30 bg-dnd-dark/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-8 py-6">

          {/* Map art credit — MOBILE: shown as block above features */}
          <div className="sm:hidden text-center text-white/50 text-[10px] font-ui leading-relaxed mb-6 pb-5 border-b border-dnd-border/30">
            <p className="text-white/40 font-body tracking-[0.2em] uppercase mb-2">Map Art</p>
            <a href="https://smitchellmaps.com" target="_blank" rel="noopener noreferrer" className="block hover:text-white/80 transition-colors">smitchellmaps.com</a>
            <a href="https://patreon.com/smitchellmaps" target="_blank" rel="noopener noreferrer" className="block hover:text-white/80 transition-colors">Patreon: @smitchellmaps</a>
            <a href="https://instagram.com/smitchellarts" target="_blank" rel="noopener noreferrer" className="block hover:text-white/80 transition-colors">Instagram: @smitchellarts</a>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: <Sword className="w-5 h-5" />, title: 'Live Turn Tracker', desc: 'Control initiative from your phone, watch it update on the big screen instantly.' },
              { icon: <Shield className="w-5 h-5" />, title: 'Visual Display Mode', desc: 'Project a cinematic battle view with creature portraits and HP bars.' },
              { icon: <ChevronRight className="w-5 h-5" />, title: 'Encounter Presets', desc: 'Save monster groups and drop them into any encounter in seconds.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-2">
                <div style={{ color: 'var(--theme-accent)' }}>{icon}</div>
                <p className="font-body text-dnd-parchment text-sm tracking-wider">{title}</p>
                <p className="text-dnd-muted font-ui text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Map art credit — DESKTOP: absolute bottom right */}
        <div className="hidden sm:block absolute bottom-3 right-6 sm:right-8 text-right text-white/50 text-[10px] font-ui leading-relaxed">
          <p className="text-white/40 font-body tracking-[0.2em] uppercase mb-1">Map Art</p>
          <a href="https://smitchellmaps.com" target="_blank" rel="noopener noreferrer" className="block hover:text-white/80 transition-colors">smitchellmaps.com</a>
          <a href="https://patreon.com/smitchellmaps" target="_blank" rel="noopener noreferrer" className="block hover:text-white/80 transition-colors">Patreon: @smitchellmaps</a>
          <a href="https://instagram.com/smitchellarts" target="_blank" rel="noopener noreferrer" className="block hover:text-white/80 transition-colors">Instagram: @smitchellarts</a>
        </div>
      </footer>
    </div>
  )
}
