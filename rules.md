# Project Rules and Guidelines

## Code Structure
1. Follow the established folder structure for components, pages, and utilities
2. Use TypeScript for all new code
3. Create reusable components whenever possible
4. Keep components focused on a single responsibility
5. Use proper naming conventions (PascalCase for components, camelCase for functions)
6. Avoid having files over 500 lines of code - refactor at that point
7. Keep the codebase very clean and organized

## Styling
1. Use Tailwind CSS for styling components
2. Follow the design system colors defined in tailwind.config.js
3. Maintain consistent spacing and sizing across components
4. Use the defined border-radius values for consistency
5. Ensure all components work in both light and dark mode

## State Management
1. Use React hooks for component-level state
2. Use context for application-wide state (auth, theme, etc.)
3. Keep state as close to where it's used as possible
4. Avoid prop drilling by using context when appropriate

## API Integration
1. Use the client-api.ts utility for all API calls
2. Handle loading and error states for all API interactions
3. Implement proper fallbacks for when API calls fail
4. Use environment variables for API keys and sensitive information
5. Use singleton connection when in development environment
6. Allow full connection pool when in production environment
7. Never mock data for dev or prod environments - mocking is only for tests
8. Never add stubbing or fake data patterns to code that affects dev or prod environments

## Coding Pattern Preferences
1. Always prefer simple solutions
2. Avoid duplication of code whenever possible
3. Check for other areas of the codebase that might already have similar code and functionality
4. Only make changes that are requested or are well understood and related to the change being requested
5. When fixing an issue or bug, do not introduce a new pattern or technology without first exhausting all options for the existing implementation
6. If introducing a new pattern, remove the old implementation to avoid duplicate logic
7. Avoid writing scripts in files if possible, especially if the script is likely only to be run once

## Performance
1. Optimize component rendering to minimize unnecessary re-renders
2. Use proper React patterns (useMemo, useCallback) where appropriate
3. Lazy load components and pages when possible
4. Optimize images and assets for faster loading

## Accessibility
1. Ensure all interactive elements are keyboard accessible
2. Use semantic HTML elements
3. Provide proper ARIA attributes when necessary
4. Maintain sufficient color contrast for text readability

## Testing
1. Write tests for critical functionality
2. Test components in isolation
3. Ensure all pages work in both light and dark mode
4. Test responsive behavior across different screen sizes
5. Use mocking only for tests, never for development or production code

## Deployment
1. Ensure all environment variables are properly set
2. Test the application thoroughly before deployment
3. Use feature branches for new development
4. Maintain a clean commit history with descriptive messages
5. Never overwrite .env files without first asking and confirming
6. Write code that takes into account different environments: dev, test, and prod
