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
        // Scalerrs color scheme from Figma
        primary: '#9EA8FB',    // periwinkle blue
        'brand-1': '#9EA8FB',  // primary brand color
        'brand-2': '#99A9FF',  // secondary brand color
        'brand-accent': '#EADCFF', // accent color
        'brand-yellow': '#FFE4A6', // brand yellow
        dark: '#12131C',       // dark navy
        gold: '#FCDC94',       // warm yellow/gold
        lavender: '#EADCFF',   // soft lavender
        lightGray: '#F5F5F9',  // light gray for backgrounds
        mediumGray: '#4F515E', // medium gray for text
        darkGray: '#181D27',   // dark gray for containers

        // Text colors
        'text-light': '#353233', // light mode text color
        'text-dark': '#FFFFFF',  // dark mode text color

        // Card colors
        'card-yellow': '#FFF9DB',
        'card-blue': '#E8EAF6',
        'card-purple': '#EDE7F6',

        // Sidebar colors
        'sidebar-bg': '#12131C',
        'sidebar-text': '#353233',
        'sidebar-active': '#2A2A3C',
        'sidebar-border': '#353233',
        'sidebar-hover': 'rgba(154, 168, 251, 0.1)',
        'sidebar-active-border': '#9EA8FB',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      borderRadius: {
        'scalerrs': '16px',
        'DEFAULT': '8px',
      },
      backgroundColor: {
        'container': 'var(--container-bg)',
      },
      textColor: {
        'container': 'var(--foreground)',
        'light-mode': '#353233',
        'dark-mode': '#FFFFFF',
      },
      borderColor: {
        'container': 'var(--container-border)',
      },
    },
  },
  plugins: [],
}
