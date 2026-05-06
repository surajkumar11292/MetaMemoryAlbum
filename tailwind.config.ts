import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: {
          DEFAULT: 'var(--surface)',
          raised: 'var(--surface-raised)',
          overlay: 'var(--surface-overlay)',
          container: 'var(--surface-container)',
          'container-high': 'var(--surface-container-high)',
        },
        border: {
          DEFAULT: 'var(--border)',
          muted: 'var(--border-muted)',
          subtle: 'var(--border-subtle)',
          active: 'var(--border-active)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
          hover: 'var(--accent-hover)',
        },
        'amber-accent': '#FFC107',
        'deep-charcoal': '#121414',
        'surface-base': '#010101',
        'surface-raised-dark': '#151310',
        'clinical-white': '#F9F9F9',
        danger: 'var(--danger)',
        success: 'var(--success)',
      },
      fontFamily: {
        display: ['EB Garamond', 'Georgia', 'serif'],
        serif: ['EB Garamond', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
      },
      spacing: {
        'max-width': '1440px',
        gutter: '24px',
        'section-gap': '80px',
        'margin-mobile': '16px',
        'margin-desktop': '64px',
      },
      boxShadow: {
        none: 'none',
      },
    },
  },
  plugins: [],
};

export default config;
