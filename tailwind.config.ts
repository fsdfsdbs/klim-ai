import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'typing-bounce': 'typingBounce 1.2s infinite ease-in-out',
      },
      keyframes: {
        typingBounce: {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.5' },
          '50%': { transform: 'translateY(-8px)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
