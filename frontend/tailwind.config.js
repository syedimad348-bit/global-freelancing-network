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
        // Light clean SaaS workspace + Deep Purple Sidebar
        canvas: '#F8FAFC',       // Slate 50 workspace background
        surface: '#FFFFFF',      // Pure white card background
        'surface-subtle': '#F1F5F9', // Slate 100 secondary
        'surface-alt': '#F8FAFC',
        sidebar: {
          DEFAULT: '#1E1035',    // Deep luxury purple sidebar
          hover: '#2A1647',
          active: '#381C5E',
          card: '#291746',
          border: 'rgba(255, 255, 255, 0.08)',
          text: '#FFFFFF',
          muted: '#C4B5FD',
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
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#7C3AED',        // Primary restrained purple
          600: '#6D28D9',
          700: '#5B21B6',
          800: '#4C1D95',
          900: '#2E1065',
        },
        accent: {
          purple: '#7C3AED',
          violet: '#8B5CF6',
          indigo: '#6366F1',
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
        'brand-gradient': 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #4F46E5 100%)',
        'purple-soft': 'linear-gradient(135deg, #FAF5FF 0%, #EDE9FE 100%)',
        'hero-gradient': 'linear-gradient(135deg, #2E1065 0%, #1E1035 100%)',
      },
    },
  },
  plugins: [],
};
