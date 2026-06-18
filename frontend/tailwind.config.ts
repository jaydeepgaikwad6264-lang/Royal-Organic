import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        royal: {
          green: '#245F4E',      // Primary (Deep Botanical Green)
          tea: '#8FAF9A',        // Secondary Accent (Muted Olive)
          beige: '#F7F8F5',      // Background (Soft Porcelain White)
          sand: '#EAE6DA',       // Neutral divider
          gold: '#C9A24D',       // Premium Accent (Muted Gold per auth pages)
          text: '#1B1B1B',       // Primary Text
          muted: '#5F6368'       // Secondary Text
        }
      },
      fontFamily: {
        heading: ['var(--font-playfair)'],
        body: ['var(--font-inter)'],
      },
      boxShadow: {
        soft: '0 8px 24px rgba(27, 27, 27, 0.06)',
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config
