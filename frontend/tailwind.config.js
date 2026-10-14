/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Light clean SaaS workspace + Deep Green Premium Sidebar
        canvas: '#F0FDF8',       // Mint 50 workspace background
        surface: '#FFFFFF',      // Pure white card background
        'surface-subtle': '#ECFDF5', // Mint 100 secondary
        'surface-alt': '#F0FDF8',
        sidebar: {
          DEFAULT: '#064E3B',    // Deep emerald green sidebar
          hover: '#065F46',
          active: '#047857',
          card: '#059669',
          border: 'rgba(255, 255, 255, 0.08)',
          text: '#FFFFFF',
          muted: '#A7F3D0',
        },
        ink: {
          DEFAULT: '#0F172A',    // Slate 900 dark charcoal headings/primary
          soft: '#334155',       // Slate 700
          muted: '#64748B',      // Slate 500 supporting text
          subtle: '#94A3B8',     // Slate 400 captions/metadata
        },
        line: {
          DEFAULT: '#E2E8F0',    // Slate 200 light thin borders
          subtle: '#F1F5F9',     // Slate 100
          strong: '#CBD5E1',     // Slate 300
        },
        brand: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',        // Primary emerald green
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        accent: {
          purple: '#10B981',
          violet: '#34D399',
          indigo: '#06B6D4',
          emerald: '#10B981',
          cyan: '#06B6D4',
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
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 4px 16px -2px rgba(15, 23, 42, 0.04)',
        cardHover: '0 10px 25px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(124, 58, 237, 0.05)',
        elevated: '0 20px 40px -15px rgba(15, 23, 42, 0.1)',
        glow: '0 4px 20px -2px rgba(124, 58, 237, 0.35)',
        'glow-sm': '0 2px 10px -1px rgba(124, 58, 237, 0.25)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)',
        'green-soft': 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
        'hero-gradient': 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
      },
    },
  },
  plugins: [],
};
