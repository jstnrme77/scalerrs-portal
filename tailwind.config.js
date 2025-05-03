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
        primary: '#9EA8FB',    // periwinkle blue - Accent 1
        'brand-1': '#9EA8FB',  // primary brand color - Accent 1
        'brand-2': '#12131C',  // secondary brand color - Headers, text, footers
        'brand-accent': '#EADCFF', // accent color - Accent 3
        'brand-yellow': '#FCDC94', // brand yellow - Accent 2
        dark: '#12131C',       // dark navy - Headers, text, footers
        gold: '#FCDC94',       // warm yellow/gold - Accent 2
        lavender: '#EADCFF',   // soft lavender - Accent 3
        lightGray: '#D9D9D9',  // light gray for backgrounds
        mediumGray: '#12131C', // text color from palette
        darkGray: '#12131C',   // text color from palette

        // Text colors
        'text-light': '#12131C', // light mode text color
        'text-dark': '#FFFFFF',  // dark mode text color

        // Card colors
        'card-yellow': '#FFF9DB',
        'card-blue': '#E8EAF6',
        'card-purple': '#EDE7F6',

        // Sidebar colors
        'sidebar-bg': '#12131C',
        'sidebar-text': '#FFFFFF',
        'sidebar-active': '#2A2A3C',
        'sidebar-border': '#12131C',
        'sidebar-hover': 'rgba(154, 168, 251, 0.1)',
        'sidebar-active-border': '#9EA8FB',
      },
      fontFamily: {
        sans: ['Roboto', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      fontSize: {
        'h1': '2rem',    /* ~32px */
        'h2': '1.75rem', /* ~28px */
        'h3': '1.5rem',  /* ~24px */
        'body': '1rem',  /* ~16px */
        'small': '0.875rem', /* ~14px */
      },
      lineHeight: {
        'h1': '1.2',
        'h2': '1.2',
        'h3': '1.2',
        'body': '1.5',
        'small': '1.5',
      },
      letterSpacing: {
        'h1': '-0.5px',
        'h2': '-0.5px',
        'h3': '-0.25px',
        'body': '0px',
        'small': '0px',
      },
      fontWeight: {
        'medium': 500,
        'regular': 400,
      },
      borderRadius: {
        'scalerrs': '16px',
        'DEFAULT': '16px',
      },
      backgroundColor: {
        'container': 'var(--container-bg)',
      },
      textColor: {
        'container': 'var(--foreground)',
        'light-mode': '#12131C',
        'dark-mode': '#FFFFFF',
      },
      borderColor: {
        'container': 'var(--container-border)',
      },
    },
  },
  plugins: [],
}
