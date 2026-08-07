/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="night"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces Variable', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans Variable', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        eyebrow: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.12em' }],
        'display-sm': ['clamp(1.25rem, 1.05rem + 0.8vw, 1.5rem)', { lineHeight: '1.2' }],
        'display-md': ['clamp(1.5rem, 1.2rem + 1.3vw, 1.875rem)', { lineHeight: '1.15' }],
        'display-lg': ['clamp(1.75rem, 1.3rem + 2vw, 2.5rem)', { lineHeight: '1.1' }],
        'display-xl': ['clamp(2rem, 1.4rem + 2.8vw, 3rem)', { lineHeight: '1.06' }],
      },
      colors: {
        // Brand colours. `soft` fills areas, base is the vivid brand colour,
        // `deep` is the only step dark enough to carry text.
        pink: 'hsl(var(--pink) / <alpha-value>)',
        'pink-soft': 'hsl(var(--pink-soft) / <alpha-value>)',
        'pink-deep': 'hsl(var(--pink-deep) / <alpha-value>)',
        mint: 'hsl(var(--mint) / <alpha-value>)',
        'mint-soft': 'hsl(var(--mint-soft) / <alpha-value>)',
        'mint-deep': 'hsl(var(--mint-deep) / <alpha-value>)',
        sky: 'hsl(var(--sky) / <alpha-value>)',
        'sky-soft': 'hsl(var(--sky-soft) / <alpha-value>)',
        'sky-deep': 'hsl(var(--sky-deep) / <alpha-value>)',
        sunny: 'hsl(var(--sunny) / <alpha-value>)',
        'sunny-soft': 'hsl(var(--sunny-soft) / <alpha-value>)',
        'sunny-deep': 'hsl(var(--sunny-deep) / <alpha-value>)',
        lavender: 'hsl(var(--lavender) / <alpha-value>)',
        'lavender-soft': 'hsl(var(--lavender-soft) / <alpha-value>)',
        'lavender-deep': 'hsl(var(--lavender-deep) / <alpha-value>)',
        coral: 'hsl(var(--coral) / <alpha-value>)',
        'coral-soft': 'hsl(var(--coral-soft) / <alpha-value>)',
        'coral-deep': 'hsl(var(--coral-deep) / <alpha-value>)',
        teal: 'hsl(var(--teal) / <alpha-value>)',
        'teal-soft': 'hsl(var(--teal-soft) / <alpha-value>)',
        'teal-deep': 'hsl(var(--teal-deep) / <alpha-value>)',
        indigo: 'hsl(var(--indigo) / <alpha-value>)',
        'indigo-soft': 'hsl(var(--indigo-soft) / <alpha-value>)',
        'indigo-deep': 'hsl(var(--indigo-deep) / <alpha-value>)',
        orchid: 'hsl(var(--orchid) / <alpha-value>)',
        'orchid-soft': 'hsl(var(--orchid-soft) / <alpha-value>)',
        'orchid-deep': 'hsl(var(--orchid-deep) / <alpha-value>)',
        moss: 'hsl(var(--moss) / <alpha-value>)',
        'moss-soft': 'hsl(var(--moss-soft) / <alpha-value>)',
        'moss-deep': 'hsl(var(--moss-deep) / <alpha-value>)',

        // Semantic
        ink: 'hsl(var(--ink) / <alpha-value>)',
        'ink-soft': 'hsl(var(--ink-soft) / <alpha-value>)',
        'ink-faint': 'hsl(var(--ink-faint) / <alpha-value>)',
        cream: 'hsl(var(--cream) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        'surface-sunk': 'hsl(var(--surface-sunk) / <alpha-value>)',
        hairline: 'hsl(var(--hairline) / <alpha-value>)',

        // The active category colour — re-pointed as you browse.
        accent: 'hsl(var(--accent) / <alpha-value>)',
        'accent-soft': 'hsl(var(--accent-soft) / <alpha-value>)',
        'accent-ink': 'hsl(var(--accent-ink) / <alpha-value>)',
      },
      borderRadius: {
        DEFAULT: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
        '3xl': '2.5rem',
        blob: '2.5rem 2.5rem 2.5rem 2.5rem',
      },
      boxShadow: {
        // Plush: layered, soft, never a hard drop shadow.
        plush: '0 1px 2px hsl(var(--shadow) / 0.04), 0 4px 12px hsl(var(--shadow) / 0.06), 0 12px 32px hsl(var(--shadow) / 0.05)',
        'plush-lg': '0 2px 4px hsl(var(--shadow) / 0.05), 0 8px 24px hsl(var(--shadow) / 0.08), 0 24px 56px hsl(var(--shadow) / 0.07)',
        'plush-sm': '0 1px 2px hsl(var(--shadow) / 0.04), 0 2px 8px hsl(var(--shadow) / 0.05)',
        glow: '0 8px 32px hsl(var(--accent) / 0.35)',
        inner: 'inset 0 1px 2px hsl(var(--shadow) / 0.06)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 1.8s infinite',
        'accordion-down': 'accordion-down 0.25s ease-out',
        'accordion-up': 'accordion-up 0.25s ease-out',
      },
      transitionTimingFunction: {
        plush: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
