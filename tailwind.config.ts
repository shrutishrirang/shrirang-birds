import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50:  '#FDFAF6',
          100: '#F8F2E8',
          200: '#EFE6D8',
          300: '#E0D2BC',
          400: '#CBBEA5',
          500: '#B0A08A',
        },
        forest: {
          light: '#6B9E7A',
          DEFAULT: '#4A7C59',
          dark:  '#2E5237',
          deep:  '#1C3622',
        },
        bark: {
          light: '#9E8E7A',
          mid:   '#6B5A4A',
          DEFAULT: '#3C2E22',
          dark:  '#1E1610',
        },
      },
      fontFamily: {
        display: ['var(--font-josefin)', 'sans-serif'],
        body:    ['var(--font-nunito)',  'sans-serif'],
        maiandra: ['var(--font-maiandra)', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.25em',
        widest3: '0.35em',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}

export default config
