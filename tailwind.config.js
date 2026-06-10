/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // CXone-style palette: white surfaces, blue accents, status alerts
        // CXone Mpower blue family
        brand: {
          50: '#eaf3ff',
          100: '#d3e6ff',
          200: '#a9ccff',
          400: '#4f93f0',
          500: '#1a73e8', // primary blue (top bar, send button, links)
          600: '#1561c9',
          700: '#0f4aa6',
          900: '#0a2e6b',
        },
        ink: {
          900: '#0f172a',
          700: '#334155',
          500: '#64748b',
          400: '#94a3b8',
          200: '#e2e8f0',
          100: '#f1f5f9',
        },
        ok: '#16a34a',
        warn: '#d97706',
        danger: '#dc2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15,23,42,0.04), 0 1px 3px 0 rgba(15,23,42,0.06)',
        panel: '0 4px 12px -2px rgba(15,23,42,0.08)',
      },
    },
  },
  plugins: [],
}
