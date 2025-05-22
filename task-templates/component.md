# Component Task Template

## Component Details
- **Name**: {{componentName}}
- **Type**: {{componentType}} (UI, Layout, Form, etc.)
- **Location**: {{componentPath}}

## Requirements
{{requirements}}

## Design Guidelines
- Follow Tailwind CSS patterns
- Ensure component is responsive
- Support both light and dark mode
- Use TypeScript for type safety

## Component Structure
```tsx
import React from 'react';
import { cn } from '../../utils/cn';

interface {{componentName}}Props {
  // Define your props here
}

export const {{componentName}} = ({ 
  // Destructure props here
}: {{componentName}}Props) => {
  return (
    <div className="...">
      {/* Component content */}
    </div>
  );
};
```

## Additional Notes
{{notes}} 