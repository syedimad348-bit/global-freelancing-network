/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Sora', 'Inter', 'ui-sans-serif', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'ui-serif', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Premium emerald + champagne palette
        canvas: '#F7FAF8',           // Soft ivory-mint workspace
        surface: '#FFFFFF',          // Pure white cards
        'surface-subtle': '#F1F6F3', // Mint-tinted secondary
        'surface-alt': '#F7FAF8',
        sidebar: {
          DEFAULT: '#052E22',        // Deep forest
          hover: '#0A3F30',
          active: '#0E5741',
          card: '#0C4A37',
          border: 'rgba(255, 255, 255, 0.08)',
          text: '#FFFFFF',
          muted: '#9FE8C9',
        },
        ink: {
          DEFAULT: '#0E1C16',        // Deep green-charcoal headings
          soft: '#2E3B36',
          muted: '#5C6B65',
          subtle: '#8A9791',
        },
        line: {
          DEFAULT: '#E4EAE6',
          subtle: '#EFF3F0',
          strong: '#CBD6D0',
        },
        brand: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',           // Primary emerald
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        gold: {
          50: '#FBF6E9',
          100: '#F5EACB',
          200: '#EBD79A',
          300: '#E0C46A',
          400: '#D4AF37',           // Champagne gold
          500: '#C39A2E',
          600: '#A87F23',
          700: '#85611A',
          800: '#5E4512',
          900: '#3D2D0C',
        },
        accent: {
          purple: '#10B981',
          violet: '#34D399',
          indigo: '#06B6D4',
          emerald: '#10B981',
          cyan: '#06B6D4',
          gold: '#D4AF37',
          amber: '#F59E0B',
          rose: '#F43F5E',
        },
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(14, 28, 22, 0.04), 0 6px 20px -6px rgba(14, 28, 22, 0.06)',
        cardHover: '0 12px 30px -8px rgba(14, 28, 22, 0.10), 0 6px 16px -6px rgba(16, 185, 129, 0.08)',
        elevated: '0 24px 48px -18px rgba(14, 28, 22, 0.16)',
        glow: '0 6px 24px -4px rgba(16, 185, 129, 0.35)',
        'glow-sm': '0 2px 12px -2px rgba(16, 185, 129, 0.28)',
        gold: '0 6px 22px -4px rgba(212, 175, 55, 0.35)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #10B981 0%, #059669 55%, #047857 100%)',
        'gold-gradient': 'linear-gradient(135deg, #E0C46A 0%, #D4AF37 50%, #A87F23 100%)',
        'green-soft': 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
        'hero-gradient': 'linear-gradient(135deg, #052E22 0%, #064E3B 55%, #047857 100%)',
        'premium-sheen': 'linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 45%)',
      },
    },
  },
  plugins: [],
};
