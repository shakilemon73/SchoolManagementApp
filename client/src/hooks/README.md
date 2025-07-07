# Custom Hooks

This directory contains custom React hooks that encapsulate reusable logic across the application.

## Available Hooks

### `useAuth`

Authentication hook that provides user authentication state and methods.

```tsx
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { 
    user,                // Current user object or null if not authenticated
    isLoading,           // Boolean indicating if authentication state is loading
    error,               // Error object if authentication failed
    loginMutation,       // Mutation for logging in
    logoutMutation,      // Mutation for logging out
    registerMutation     // Mutation for registering a new user
  } = useAuth();
  
  // Example login
  const handleLogin = () => {
    loginMutation.mutate({ 
      username: 'user', 
      password: 'pass' 
    });
  };
  
  return (
    // Component JSX
  );
}
```

### `useLanguage`

Hook for handling multilingual support.

```tsx
import { useLanguage } from '@/hooks/use-language';

function MyComponent() {
  const { 
    language,            // Current language code (en, bn, ar)
    changeLanguage,      // Function to change the language
    t                    // Translation function
  } = useLanguage();
  
  // Change language example
  const handleLanguageChange = () => {
    changeLanguage('bn');
  };
  
  return (
    <div>
      <p>{t('common.hello')}</p>
      <button onClick={handleLanguageChange}>
        {t('common.changeLanguage')}
      </button>
    </div>
  );
}
```

### `useMobile`

Hook that provides responsive design utilities.

```tsx
import { useMobile } from '@/hooks/use-mobile';

function MyComponent() {
  const { 
    isMobile,      // Boolean indicating if the viewport is mobile-sized
    orientation    // Current orientation ('portrait' or 'landscape')
  } = useMobile();
  
  return (
    <div>
      {isMobile ? (
        <MobileView />
      ) : (
        <DesktopView />
      )}
    </div>
  );
}
```

### `useToast`

Hook for displaying toast notifications.

```tsx
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const { toast } = useToast();
  
  const handleAction = () => {
    // Show a success toast
    toast({
      title: "Success!",
      description: "Operation completed successfully",
      variant: "default",
    });
    
    // Show an error toast
    toast({
      title: "Error!",
      description: "Something went wrong",
      variant: "destructive",
    });
  };
  
  return (
    // Component JSX
  );
}
```

## Creating New Hooks

Follow these guidelines when creating new hooks:

1. **Single Responsibility**: Each hook should focus on a specific concern
2. **Naming**: Use the `use` prefix followed by a descriptive name
3. **Documentation**: Document the hook's purpose, parameters, and return values
4. **Error Handling**: Implement appropriate error handling
5. **TypeScript**: Define proper types for parameters and return values

Example structure for a new hook:

```tsx
import { useState, useEffect } from 'react';

/**
 * useExample - Brief description of what this hook does
 * 
 * @param {string} param - Description of the parameter
 * @returns {Object} - Description of the return value
 */
export function useExample(param: string) {
  const [state, setState] = useState<string>('');
  
  useEffect(() => {
    // Hook logic
  }, [param]);
  
  const doSomething = () => {
    // Method logic
  };
  
  return {
    state,
    doSomething
  };
}
```

## Best Practices

1. Use TypeScript for type safety
2. Avoid side effects in hooks
3. Follow the React Hooks rules (only call hooks at the top level)
4. Keep hooks focused and reusable
5. Provide meaningful default values
6. Handle loading and error states