// This script runs before the React app loads to set the initial theme
// It prevents flash of wrong theme by applying the theme immediately

// This is a string that will be injected into the HTML
export function themeScript() {
  return `
    (function() {
      try {
        // Check for saved theme preference or use system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Apply dark mode if needed
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {
        // Fail gracefully if localStorage is not available
        console.error('Theme script error:', e);
      }
    })();
  `;
}
