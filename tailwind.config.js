// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rivel: '#f43f5e',
        'rivel-light': '#ffe4e6',
        'rivel-dark': '#be123c',
        night: '#0f172a',
      },
      animation: {
        avatarFadeIn: 'fadeInScale 0.3s ease-out forwards',
      },
      keyframes: {
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}