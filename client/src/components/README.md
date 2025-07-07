# Components Directory

This directory contains all the reusable UI components used throughout the application.

## Directory Structure

- `ui/`: Base UI components built with shadcn/ui and Tailwind CSS
- `layout/`: Layout components such as headers, sidebars, and page layouts
- `documents/`: Components related to document generation and preview
- `dashboard/`: Components used in the dashboard views
- `credits/`: Components related to the credit system

## Component Guidelines

### Naming Conventions

- Use PascalCase for component files and component names
- Use descriptive names that indicate the component's purpose
- Use `.tsx` extension for all React components

### Component Structure

Each component should follow this structure:

```tsx
import { type FC } from 'react';
import { useTranslation } from '@/shared/i18n';
// Other imports...

interface ComponentNameProps {
  // Document props with JSDoc comments
  /** Description of the prop */
  propName: PropType;
}

/**
 * ComponentName - Brief description of what this component does
 * 
 * @example
 * <ComponentName propName={value} />
 */
export const ComponentName: FC<ComponentNameProps> = ({ propName }) => {
  const { t } = useTranslation();
  
  // Component logic
  
  return (
    // JSX
  );
};

export default ComponentName;
```

### Best Practices

1. **Props**: Define a clear interface for component props
2. **State Management**: Use appropriate hooks for state management
3. **Separation of Concerns**: Split complex components into smaller sub-components
4. **Internationalization**: Use the `useTranslation` hook for all user-facing text
5. **Accessibility**: Ensure proper ARIA attributes and keyboard navigation
6. **Responsiveness**: Design components to work on both mobile and desktop
7. **Error Handling**: Implement appropriate error states and fallbacks

### When to Create a New Component

Create a new component when:
- The UI element is used in multiple places
- The UI element has complex logic or state management
- The UI element represents a clear, distinct part of the UI

## Adding New Components

1. Determine which subdirectory is appropriate for your component
2. Create a new file with the component name (e.g., `MyComponent.tsx`)
3. Follow the component structure outlined above
4. Export the component from the file
5. Import and use the component where needed

## Examples

Check these components for reference:
- `ui/Button.tsx`: A simple UI component
- `layout/Sidebar.tsx`: A layout component
- `documents/ReceiptGenerator.tsx`: A feature component with complex logic