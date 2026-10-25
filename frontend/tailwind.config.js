/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#f8f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e5eeff',
        'surface-container-high': '#dce9ff',
        'surface-container-highest': '#d6e3f9',
        'on-surface': '#0f1c2c',
        'on-surface-variant': '#434654',
        primary: '#003fb3',
        'primary-container': '#2457d6',
        'on-primary': '#ffffff',
        'on-primary-container': '#d5dcff',
        secondary: '#006781',
        'on-secondary': '#ffffff',
        tertiary: '#832f00',
        'tertiary-container': '#aa3f00',
        'on-tertiary-container': '#ffd5c5',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        outline: '#747686',
        'outline-variant': '#c3c5d7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
