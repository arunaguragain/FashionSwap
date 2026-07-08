/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          900: '#0F3F7F',
          800: '#1E5BA8',
          700: '#2D7EC8',
          600: '#3D9FE8'
        },
        success: {
          500: '#10B981',
          400: '#34D399'
        },
        danger: {
          500: '#DC2626',
          400: '#EF4444'
        },
        neutral: {
          700: '#6B7280',
          100: '#F3F4F6'
        }
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px'
      },
      borderRadius: {
        'lg': '8px'
      },
      fontSize: {
        'display': ['48px', '56px'],
        'h1': ['36px', '44px'],
        'h2': ['28px', '36px'],
        'h3': ['24px', '32px'],
        'lg': ['18px', '28px'],
        'base': ['16px', '24px'],
        'sm': ['14px', '20px'],
        'caption': ['12px', '16px']
      }
    }
  },
  plugins: [],
}
