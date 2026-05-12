/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#B8953F',
          light: '#D4AF6A',
          dim: '#7A6030',
        },
        dark: {
          DEFAULT: '#0C0C0E',
          2: '#141418',
          3: '#1C1C22',
          4: '#24242C',
        },
        surface: '#2A2A34',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
