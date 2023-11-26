/** @type {import('tailwindcss').Config} */
export default {
  mode: "jit",
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#202225',
        secondary: '#5865f2',
      }
    },
  },
  plugins: [],
}

