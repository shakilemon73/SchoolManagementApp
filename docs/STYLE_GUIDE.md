# Style Guide for School Management System

This style guide outlines the coding conventions and best practices for our School Management System project. Following these guidelines will ensure consistency across the codebase and make it easier for developers to understand, maintain, and extend the application.

## Table of Contents

1. [File Organization](#file-organization)
2. [Naming Conventions](#naming-conventions)
3. [TypeScript Guidelines](#typescript-guidelines)
4. [React Best Practices](#react-best-practices)
5. [CSS and Styling](#css-and-styling)
6. [State Management](#state-management)
7. [API Communication](#api-communication)
8. [Internationalization](#internationalization)
9. [Testing](#testing)
10. [Documentation](#documentation)

## File Organization

### Directory Structure

- **Feature-based organization**: Group related files by feature rather than by file type
- **Component co-location**: Keep component-related files (styles, tests, utilities) close to the component

```
feature/
  ├── components/           # UI components specific to this feature
  ├── hooks/                # Custom hooks for this feature
  ├── utils/                # Helper functions
  ├── types.ts              # TypeScript interfaces and types
  ├── constants.ts          # Constants and configuration
  └── index.ts              # Export public API of the feature
```

### Imports Order

1. External libraries
2. Absolute imports from the application
3. Relative imports from the same feature
4. Type imports
5. CSS/SCSS imports

Example:
```tsx
// 1. External libraries
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Absolute imports from the application
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// 3. Relative imports from the same feature
import { FeatureHeader } from './components/FeatureHeader';
import { useFeatureData } from './hooks/use-feature-data';

// 4. Type imports
import type { FeatureData } from './types';

// 5. CSS imports
import './feature.css';
```

## Naming Conventions

### General

- **Descriptive names**: Use clear, descriptive names that indicate purpose
- **Avoid abbreviations**: Use full words unless abbreviations are widely understood

### Files and Directories

- **Component files**: PascalCase with `.tsx` extension (e.g., `StudentCard.tsx`)
- **Hook files**: camelCase with `use` prefix and `.ts` extension (e.g., `useStudentData.ts`)
- **Utility files**: camelCase with `.ts` extension (e.g., `formatDate.ts`)
- **Test files**: Same name as the file being tested with `.test.tsx` or `.spec.tsx` extension
- **Feature directories**: kebab-case (e.g., `student-management/`)

### Components

- **Component names**: PascalCase (e.g., `StudentCard`, `DashboardHeader`)
- **Component props**: PascalCase with `Props` suffix (e.g., `StudentCardProps`)

### Variables and Functions

- **Variables**: camelCase (e.g., `studentData`, `isLoading`)
- **Boolean variables**: Prefix with `is`, `has`, `should`, etc. (e.g., `isActive`, `hasPermission`)
- **Functions**: camelCase (e.g., `fetchStudents`, `handleSubmit`)
- **Event handlers**: Prefix with `handle` or `on` (e.g., `handleClick`, `onSubmit`)
- **Constants**: UPPER_SNAKE_CASE for true constants, camelCase for other variables

## TypeScript Guidelines

### Type Definitions

- Define types for all props, state, and function parameters/returns
- Use interfaces for objects that will be extended or implemented
- Use type aliases for unions, intersections, and simpler objects
- Export types that will be used outside the file

```tsx
// Interface for extensible objects
export interface StudentBase {
  id: number;
  name: string;
  grade: number;
}

// Extended interface
export interface Student extends StudentBase {
  enrollmentDate: Date;
  status: 'active' | 'inactive' | 'graduated';
}

// Type alias for unions
export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

// Function parameter and return types
export function filterStudents(
  students: Student[], 
  criteria: { status?: Student['status'], grade?: number }
): Student[] {
  // Implementation
}
```

### Type vs Interface

- Use `interface` for objects that represent entities in your domain
- Use `type` for unions, mapped types, and utility types

### Enums vs Union Types

- Prefer union types over enums for simple cases:
  ```typescript
  // Prefer this
  type Status = 'pending' | 'active' | 'completed';
  
  // Over this
  enum Status {
    Pending = 'pending',
    Active = 'active',
    Completed = 'completed'
  }
  ```

### Type Assertions

- Avoid using `any` type when possible
- Use type assertions (`as Type`) only when necessary
- Prefer type guards over assertions:
  ```typescript
  // Type guard
  function isStudent(user: any): user is Student {
    return user && 
      typeof user.id === 'number' && 
      typeof user.name === 'string' &&
      typeof user.grade === 'number';
  }
  ```

## React Best Practices

### Functional Components

- Use functional components with hooks instead of class components
- Destructure props in the component signature
- Use explicit return type annotations for complex components

```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};
```

### Hooks

- Follow React's rules of hooks
- Create custom hooks for reusing logic
- Keep hooks focused on specific functionality
- Place shared hooks in the `hooks` directory and feature-specific hooks in the feature directory

### State Management

- Use `useState` for simple, component-specific state
- Use `useReducer` for complex state logic
- Use React Query for server state
- Use Context API for shared state that doesn't change frequently
- Keep state as close as possible to where it's used

### Performance Optimization

- Use `React.memo` for pure components that render often
- Use `useCallback` for functions passed as props
- Use `useMemo` for expensive calculations
- Use the DevTools Profiler to identify performance bottlenecks

## CSS and Styling

### Tailwind CSS

- Use Tailwind CSS utility classes for styling
- Follow the component-first approach with shadcn/ui
- Use consistent spacing and sizing scales

### Dark Mode

- Support dark mode with Tailwind's `dark:` variant
- Test all components in both light and dark modes

### Responsive Design

- Design for mobile first, then enhance for larger screens
- Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, etc.)
- Test on various screen sizes and devices

## State Management

### Local State

- Use `useState` for simple state
- Use `useReducer` for complex state logic

### Server State

- Use React Query for fetching, caching, and updating server data
- Define query keys using consistent patterns
- Implement optimistic updates for mutations
- Handle loading and error states

### Global State

- Use the Context API for sharing state between components
- Split context by domain/feature to avoid unnecessary re-renders
- Consider performance implications when using context

## API Communication

### Request Pattern

- Use React Query for data fetching
- Implement a consistent error handling strategy
- Add retry logic for failed requests
- Cache responses appropriately

### Error Handling

- Display user-friendly error messages
- Log detailed errors for debugging
- Implement fallback UI for error states

## Internationalization

### Translation Keys

- Use hierarchical key structure: `feature.component.text`
- Keep translations in separate files by language
- Use variables for dynamic content

### Formatting

- Use appropriate formatters for dates, numbers, and currencies
- Consider cultural differences in formatting

## Testing

### Unit Tests

- Test individual components and functions
- Mock external dependencies
- Focus on testing behavior, not implementation details

### Integration Tests

- Test interactions between components
- Test key user flows

### Test Coverage

- Aim for high coverage of critical paths
- Don't pursue 100% coverage at the expense of test quality

## Documentation

### Code Comments

- Use JSDoc style comments for functions, components, and complex logic
- Document non-obvious behavior and edge cases
- Keep comments up to date with code changes

### README Files

- Provide a README for each major feature or directory
- Include setup instructions, usage examples, and architectural decisions

### API Documentation

- Document API endpoints with parameters, return types, and examples
- Keep API documentation in sync with implementation

---

By following these guidelines, we can ensure a consistent, maintainable, and developer-friendly codebase. This style guide is a living document and should be updated as our practices evolve.