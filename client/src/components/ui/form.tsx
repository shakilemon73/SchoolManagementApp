import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  
  // Safely get form context or provide fallback values
  let formContext = null;
  try {
    formContext = useFormContext();
  } catch (error) {
    // Form context is not available, use fallback
    return {
      id: itemContext?.id || 'fallback-id',
      name: fieldContext?.name || 'fallback-name',
      formItemId: 'fallback-form-item',
      formDescriptionId: 'fallback-form-item-description',
      formMessageId: 'fallback-form-item-message',
    }
  }
  
  // If we have form context, continue with normal behavior
  if (formContext) {
    const { getFieldState, formState } = formContext;
    
    if (!fieldContext) {
      console.warn("useFormField should be used within <FormField>");
      return {
        id: itemContext?.id || 'missing-id',
        name: 'missing-name',
        formItemId: 'missing-form-item',
        formDescriptionId: 'missing-form-item-description',
        formMessageId: 'missing-form-item-message',
      }
    }
    
    const fieldState = getFieldState(fieldContext.name, formState)
    const { id } = itemContext || { id: 'missing-item-id' }
    
    return {
      id,
      name: fieldContext.name,
      formItemId: `${id}-form-item`,
      formDescriptionId: `${id}-form-item-description`,
      formMessageId: `${id}-form-item-message`,
      ...fieldState,
    }
  }
  
  // Fallback return if something unexpected happens
  return {
    id: 'error-id',
    name: 'error-name',
    formItemId: 'error-form-item',
    formDescriptionId: 'error-form-item-description',
    formMessageId: 'error-form-item-message',
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const fieldInfo = useFormField()
  // Safe access to error property which might not exist in fallback object
  const hasError = 'error' in fieldInfo && fieldInfo.error
  const formItemId = fieldInfo.formItemId

  return (
    <Label
      ref={ref}
      className={cn(hasError && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const fieldInfo = useFormField()
  // Safe access to properties
  const hasError = 'error' in fieldInfo && fieldInfo.error
  const formItemId = fieldInfo.formItemId
  const formDescriptionId = fieldInfo.formDescriptionId
  const formMessageId = fieldInfo.formMessageId

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !hasError
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!hasError}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const fieldInfo = useFormField()
  
  // Safe access to error property
  const errorMessage = 'error' in fieldInfo && fieldInfo.error 
    ? String(fieldInfo.error?.message) 
    : null
  const formMessageId = fieldInfo.formMessageId
  
  // Use error message if available, otherwise use children
  const body = errorMessage || children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
