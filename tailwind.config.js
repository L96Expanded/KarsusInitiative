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
          black:    '#0C0A08',   // warm near-black
          dark:     '#131108',   // warm dark stone
          surface:  '#1C1912',   // stone surface
          card:     '#252114',   // weathered stone card
          border:   '#46402E',   // aged stone edge
          crimson:  '#8B1C1C',   // danger
          red:      '#C0392B',   // bright danger
          gold:     '#C8960C',   // warm amber-gold (lantern light)
          amber:    '#E8B820',   // bright sunlight amber
          teal:     '#0C6B5A',   // deep jade sea
          jade:     '#17967C',   // bright jade
          parchment:'#F0E4C4',   // warm cream
          muted:    '#8A7862',   // warm stone muted
          stone:    '#5C5040',   // mid stone
          // legacy aliases so existing code still works
          purple:   '#0C6B5A',
          violet:   '#17967C',
        },
      },
      fontFamily: {
        display: ['"Cinzel Decorative"', '"MedievalSharp"', 'Georgia', 'serif'],
        body:    ['"Cinzel"', '"Palatino Linotype"', 'Georgia', 'serif'],
        ui:      ['"IM Fell English"', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'parchment': "url('/textures/parchment.png')",
        'stone':     "url('/textures/stone.png')",
      },
      boxShadow: {
        'glow-gold':   '0 0 20px rgba(200,150,12,0.45)',
        'glow-teal':   '0 0 20px rgba(23,150,124,0.45)',
        'glow-red':    '0 0 20px rgba(139, 28, 28, 0.6)',
        'glow-purple': '0 0 20px rgba(12,107,90,0.4)',
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
