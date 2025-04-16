/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Scalerrs color scheme
        primary: '#9EA8FB', // periwinkle blue
        dark: '#12131C',    // dark navy
        gold: '#FCDC94',    // warm yellow/gold
        lavender: '#EADCFF', // soft lavender
        lightGray: '#F5F5F9',
        mediumGray: '#4F515E',
        darkGray: '#181D27',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'scalerrs': '16px',
        'DEFAULT': '8px',
      },
    },
  },
  plugins: [],
}
