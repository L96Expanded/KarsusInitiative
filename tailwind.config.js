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
          black:    '#050F14',   // deep night sky
          dark:     '#081820',   // deep dusk
          surface:  '#0D2530',   // twilight surface
          card:     '#102B38',   // adventure card
          border:   '#1A4055',   // horizon edge
          crimson:  '#8B1C1C',   // danger — unchanged
          red:      '#C0392B',   // bright danger — unchanged
          gold:     '#E8A917',   // warm lantern gold
          amber:    '#F5C842',   // bright treasure amber
          teal:     '#0D9488',   // freedom teal (primary actions)
          jade:     '#2DD4BF',   // aquamarine accent (focus / active)
          parchment:'#D0EEE8',   // cool seafoam white (main text)
          muted:    '#4D8A80',   // muted teal-grey
          stone:    '#1E4A55',   // deep stone-teal
          // legacy aliases
          purple:   '#0D9488',
          violet:   '#2DD4BF',
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
