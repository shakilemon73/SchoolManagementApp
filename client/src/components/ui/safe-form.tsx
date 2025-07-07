import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';

/**
 * SafeForm is a wrapper component that provides a FormProvider context 
 * to prevent errors when using Form components outside of a form context.
 * This is particularly useful for pages that use UI components that internally
 * rely on form contexts without actually being part of a form.
 */
export function SafeForm({ children }: { children: React.ReactNode }) {
  // Create a dummy form context that won't be used for actual form submission
  const methods = useForm();
  
  return (
    <FormProvider {...methods}>
      {children}
    </FormProvider>
  );
}