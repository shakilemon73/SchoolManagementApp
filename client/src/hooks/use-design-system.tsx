/**
 * Design System Hook
 * Automatically applies UX principles from world-class designers
 * Norman, Krug, Wroblewski, Walter, Ive, Zhuo, Rams, Madzima, Cooper, Weinschenk
 */

import { useEffect, useRef } from 'react';
import { enforceButtonDesign, enforceCardDesign, enforceFormDesign, enforceNavDesign, enforceTextDesign, uxValidators } from '@/lib/design-enforcer';
import { cn } from '@/lib/utils';

// Hook to automatically enhance components with UX principles
export function useDesignSystem() {
  const enhanceComponent = (element: HTMLElement, type: string, variant?: string) => {
    switch (type) {
      case 'button':
        element.className = enforceButtonDesign(variant as any, element.className);
        break;
      case 'card':
        element.className = enforceCardDesign(variant === 'interactive', element.className);
        break;
      case 'input':
        element.className = enforceFormDesign('input', element.className);
        break;
      case 'nav':
        element.className = enforceNavDesign(variant as any, element.className);
        break;
      default:
        // Apply general enhancements
        element.className = cn(element.className, 'transition-all duration-200');
    }
  };

  const validateUX = (element: HTMLElement) => {
    const issues = [];
    
    // Norman: Check affordances
    if (element.tagName === 'BUTTON' && !uxValidators.validateAffordance(element)) {
      issues.push('Button lacks clear affordance');
    }
    
    // Wroblewski: Check touch targets
    if (!uxValidators.validateTouchTarget(element)) {
      issues.push('Touch target too small');
    }
    
    // Madzima: Check accessibility
    if (!uxValidators.validateAccessibility(element)) {
      issues.push('Missing accessibility attributes');
    }
    
    return issues;
  };

  return { enhanceComponent, validateUX };
}

// Hook for button components following Norman & Walter principles
export function useUXButton(variant: 'primary' | 'secondary' | 'ghost' | 'destructive' = 'primary') {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    
    // Apply UX principles
    button.className = enforceButtonDesign(variant, button.className);
    
    // Ensure accessibility (Madzima)
    if (!button.getAttribute('aria-label') && !button.textContent) {
      button.setAttribute('aria-label', 'Button');
    }
    
    // Ensure minimum touch target (Wroblewski)
    const rect = button.getBoundingClientRect();
    if (rect.height < 44 || rect.width < 44) {
      button.style.minHeight = '44px';
      button.style.minWidth = '44px';
    }
  }, [variant]);
  
  return buttonRef;
}

// Hook for card components following Rams & Ive principles
export function useUXCard(interactive: boolean = false) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    
    // Apply UX principles
    card.className = enforceCardDesign(interactive, card.className);
    
    // Add focus management for interactive cards (Norman)
    if (interactive) {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
    }
  }, [interactive]);
  
  return cardRef;
}

// Hook for form components following Wroblewski & Cooper principles
export function useUXForm() {
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    
    // Apply container styling
    form.className = enforceFormDesign('container', form.className);
    
    // Enhance all inputs in the form
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach((input: Element) => {
      if (input instanceof HTMLElement) {
        input.className = enforceFormDesign('input', input.className);
        
        // Ensure accessibility
        const label = form.querySelector(`label[for="${input.id}"]`);
        if (!label && !input.getAttribute('aria-label')) {
          input.setAttribute('aria-label', input.getAttribute('placeholder') || 'Input field');
        }
      }
    });
    
    // Enhance all labels
    const labels = form.querySelectorAll('label');
    labels.forEach((label: Element) => {
      if (label instanceof HTMLElement) {
        label.className = enforceFormDesign('label', label.className);
      }
    });
    
    // Add form validation following Cooper's forgiveness principle
    form.setAttribute('novalidate', 'true');
  }, []);
  
  return formRef;
}

// Hook for navigation components following Krug & Norman principles
export function useUXNav() {
  const navRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    
    // Enhance navigation items
    const navItems = nav.querySelectorAll('a, button');
    navItems.forEach((item: Element) => {
      if (item instanceof HTMLElement) {
        // Check if active
        const isActive = item.getAttribute('aria-current') === 'page' || 
                        item.classList.contains('active');
        
        item.className = enforceNavDesign(isActive ? 'active' : 'inactive', item.className);
        
        // Ensure minimum touch target
        item.style.minHeight = '44px';
        
        // Add role if not present
        if (!item.getAttribute('role')) {
          item.setAttribute('role', 'menuitem');
        }
      }
    });
    
    // Add navigation landmark
    nav.setAttribute('role', 'navigation');
    if (!nav.getAttribute('aria-label')) {
      nav.setAttribute('aria-label', 'Main navigation');
    }
  }, []);
  
  return navRef;
}

// Hook for text components following Weinschenk & Krug principles
export function useUXText(level: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' = 'body') {
  const textRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const text = textRef.current;
    if (!text) return;
    
    text.className = enforceTextDesign(level, text.className);
    
    // Ensure proper heading hierarchy (Weinschenk)
    if (level.startsWith('h') && text.tagName.toLowerCase() !== level) {
      console.warn(`UX Warning: ${text.tagName} should be ${level.toUpperCase()} for proper hierarchy`);
    }
  }, [level]);
  
  return textRef;
}

// Hook to automatically enhance existing components
export function useAutoEnhance() {
  useEffect(() => {
    // Auto-enhance buttons
    const buttons = document.querySelectorAll('button:not([data-ux-enhanced])');
    buttons.forEach((button: Element) => {
      if (button instanceof HTMLElement) {
        button.className = enforceButtonDesign('primary', button.className);
        button.setAttribute('data-ux-enhanced', 'true');
      }
    });
    
    // Auto-enhance cards
    const cards = document.querySelectorAll('[data-card]:not([data-ux-enhanced])');
    cards.forEach((card: Element) => {
      if (card instanceof HTMLElement) {
        card.className = enforceCardDesign(false, card.className);
        card.setAttribute('data-ux-enhanced', 'true');
      }
    });
    
    // Auto-enhance inputs
    const inputs = document.querySelectorAll('input:not([data-ux-enhanced])');
    inputs.forEach((input: Element) => {
      if (input instanceof HTMLElement) {
        input.className = enforceFormDesign('input', input.className);
        input.setAttribute('data-ux-enhanced', 'true');
      }
    });
  }, []);
}