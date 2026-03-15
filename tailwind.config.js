/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dnd: {
          // ── Fully theme-responsive (vary per color theme) ──────────────────
          black:    'var(--bg-black)',
          dark:     'rgb(var(--bg-dark-rgb) / <alpha-value>)',
          surface:  'rgb(var(--bg-surface-rgb) / <alpha-value>)',
          card:     'rgb(var(--bg-card-rgb) / <alpha-value>)',
          border:   'rgb(var(--bg-border-rgb) / <alpha-value>)',
          parchment:'rgb(var(--color-text-rgb) / <alpha-value>)',
          muted:    'rgb(var(--color-muted-rgb) / <alpha-value>)',
          gold:     'rgb(var(--color-heading-rgb) / <alpha-value>)',
          amber:    'rgb(var(--color-heading-bright-rgb) / <alpha-value>)',
          teal:     'rgb(var(--theme-primary-rgb) / <alpha-value>)',
          jade:     'rgb(var(--theme-accent-rgb) / <alpha-value>)',
          stone:    'rgb(var(--bg-surface-rgb) / <alpha-value>)',
          // legacy aliases — also theme-responsive
          purple:   'rgb(var(--theme-primary-rgb) / <alpha-value>)',
          violet:   'rgb(var(--theme-accent-rgb) / <alpha-value>)',
          // ── Semantic danger colors — fixed (theme-invariant) ──────────────
          crimson:  '#8B1C1C',
          red:      '#C0392B',
        },
      },
      fontFamily: {
        display: ['"Cinzel Decorative"', '"MedievalSharp"', 'Georgia', 'serif'],
        body:    ['"Cinzel"', '"Palatino Linotype"', 'Georgia', 'serif'],
        ui:      ['"IM Fell English"', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'city': "url('/bg-city.jpg')",
      },
      boxShadow: {
        'glow-gold':   '0 0 20px rgba(232,169,23,0.45)',
        'glow-teal':   '0 0 24px rgba(13,148,136,0.55)',
        'glow-jade':   '0 0 24px rgba(45,212,191,0.50)',
        'glow-red':    '0 0 20px rgba(192,57,43,0.6)',
        'glow-purple': '0 0 20px rgba(13,148,136,0.4)',
        'card':        '0 4px 24px rgba(0,0,0,0.7)',
      },
      animation: {
        'pulse-gold': 'pulseGold 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-in':   'slideIn 0.3s ease-out',
        'fade-in':    'fadeIn 0.2s ease-out',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(200,150,12,0.3)' },
          '50%':      { boxShadow: '0 0 28px rgba(200,150,12,0.8)' },
        },
        slideIn: {
          '0%':   { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
