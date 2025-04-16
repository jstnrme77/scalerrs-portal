// Theme configuration based on the design system
export const themeConfig = {
  light: {
    background: '#FFFFFF',
    foreground: '#12131C',
    card: '#FFFFFF',
    cardForeground: '#12131C',
    border: '#F5F5F9',
    primary: '#9EA8FB',
    primaryForeground: '#FFFFFF',
    secondary: '#F5F5F9',
    secondaryForeground: '#4F515E',
    accent: '#FCDC94',
    accentForeground: '#12131C',
    muted: '#F5F5F9',
    mutedForeground: '#4F515E',
  },
  dark: {
    background: '#12131C',
    foreground: '#FFFFFF',
    card: '#181D27',
    cardForeground: '#FFFFFF',
    border: '#4F515E',
    primary: '#9EA8FB',
    primaryForeground: '#FFFFFF',
    secondary: '#181D27',
    secondaryForeground: '#a0a0a0',
    accent: '#FCDC94',
    accentForeground: '#12131C',
    muted: '#181D27',
    mutedForeground: '#a0a0a0',
  }
};

// Button variants based on the design system
export const buttonVariants = {
  light: {
    primary: 'bg-primary text-white hover:bg-primary/80',
    secondary: 'bg-secondary text-secondaryForeground hover:bg-secondary/80',
    outline: 'border border-primary text-primary hover:bg-primary/10',
    ghost: 'text-primary hover:bg-secondary',
  },
  dark: {
    primary: 'bg-primary text-white hover:bg-primary/80',
    secondary: 'bg-secondary text-secondaryForeground hover:bg-secondary/80',
    outline: 'border border-primary text-primary hover:bg-primary/10',
    ghost: 'text-primary hover:bg-secondary',
  }
};
