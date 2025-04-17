// This script runs before the React app loads to set the initial theme
// It prevents flash of wrong theme by applying the theme immediately

// This is a string that will be injected into the HTML
export function themeScript() {
  return `
    (function() {
      try {
        // Check for saved theme preference or use system preference
        // Try both theme keys for backward compatibility
        const savedTheme = localStorage.getItem('theme') || localStorage.getItem('scalerrs-theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Apply dark mode if needed
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
          document.documentElement.classList.add('dark');
          // Ensure both theme keys are set
          localStorage.setItem('theme', 'dark');
          localStorage.setItem('scalerrs-theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          // Ensure both theme keys are set
          localStorage.setItem('theme', 'light');
          localStorage.setItem('scalerrs-theme', 'light');
        }
      } catch (e) {
        // Fail gracefully if localStorage is not available
        console.error('Theme script error:', e);
      }
    })();
  `;
}
