
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.7rem',
        'sm': '0.8rem',
        'base': '0.875rem',
        'lg': '1rem',
        'xl': '1.125rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '1.875rem',
        '5xl': '2.25rem',
      },
      colors: {
        brand: {
          DEFAULT: '#ffc633',
          dim: '#e6b22e',
          dark: '#b38b24',
          light: '#ffe08a'
        }
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideUp': 'slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'slideIn': 'slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'dots-rotate': 'dotsRotate 2s linear infinite',
        'dot-pulse': 'dotPulse 1.5s ease-in-out infinite',
        'float-slow': 'floatSlow 10s ease-in-out infinite',
        'wave-move': 'waveMove 20s linear infinite',
        'wing-flap': 'wingFlap 0.2s infinite alternate',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { '0%': { opacity: '0', transform: 'translateX(10px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        dotsRotate: { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
        dotPulse: { '0%, 100%': { transform: 'scale(0.5)', opacity: '0.3' }, '50%': { transform: 'scale(1.2)', opacity: '1' } },
        floatSlow: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' }
        },
        waveMove: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        wingFlap: {
          '0%': { transform: 'rotate(-12deg)' },
          '100%': { transform: 'rotate(-25deg)' }
        }
      },
    }
  },
  plugins: [],
}
