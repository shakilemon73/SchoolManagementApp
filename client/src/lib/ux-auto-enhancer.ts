/**
 * UX Auto-Enhancement System
 * Automatically applies world-class design principles to all components
 * Norman, Krug, Wroblewski, Walter, Ive, Zhuo, Rams, Madzima, Cooper, Weinschenk
 */

import { enforceButtonDesign, enforceCardDesign, enforceFormDesign, enforceNavDesign, enforceTextDesign, enforceAccessibility } from './design-enforcer';
import { cn } from './utils';

// Component enhancement rules based on expert principles
const enhancementRules = {
  // Norman: Clear affordances and feedback
  button: {
    selector: 'button, [role="button"], input[type="button"], input[type="submit"]',
    enhance: (element: HTMLElement) => {
      const variant = element.getAttribute('data-variant') || 'primary';
      element.className = enforceButtonDesign(variant as any, element.className);
      
      // Ensure clear affordances (Norman)
      element.style.cursor = 'pointer';
      
      // Minimum touch target (Wroblewski)
      const rect = element.getBoundingClientRect();
      if (rect.height < 44) element.style.minHeight = '44px';
      if (rect.width < 44) element.style.minWidth = '44px';
      
      // Accessibility (Madzima)
      if (!element.getAttribute('aria-label') && !element.textContent?.trim()) {
        element.setAttribute('aria-label', 'Button');
      }
    }
  },

  // Rams: Minimal design, Ive: Purposeful elements
  card: {
    selector: '.card, [data-card], .bg-white.rounded, .border.rounded',
    enhance: (element: HTMLElement) => {
      const interactive = element.getAttribute('data-interactive') === 'true' || 
                         element.onclick !== null ||
                         element.getAttribute('role') === 'button';
      
      element.className = enforceCardDesign(interactive, element.className);
      
      // Add proper semantics
      if (interactive && !element.getAttribute('role')) {
        element.setAttribute('role', 'button');
        element.setAttribute('tabindex', '0');
      }
    }
  },

  // Wroblewski: Mobile-first forms, Cooper: Goal-oriented
  input: {
    selector: 'input, select, textarea',
    enhance: (element: HTMLElement) => {
      element.className = enforceFormDesign('input', element.className);
      
      // Ensure accessibility
      const id = element.id;
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (!label && !element.getAttribute('aria-label')) {
          const placeholder = element.getAttribute('placeholder');
          if (placeholder) {
            element.setAttribute('aria-label', placeholder);
          }
        }
      }
      
      // Mobile-friendly sizing
      element.style.minHeight = '44px';
    }
  },

  // Krug: Scannable navigation, Norman: Clear mapping
  navigation: {
    selector: 'nav a, [role="navigation"] a, .nav-item, [data-nav-item]',
    enhance: (element: HTMLElement) => {
      const isActive = element.getAttribute('aria-current') === 'page' ||
                      element.classList.contains('active') ||
                      element.getAttribute('data-active') === 'true';
      
      element.className = enforceNavDesign(isActive ? 'active' : 'inactive', element.className);
      
      // Ensure minimum touch target
      element.style.minHeight = '44px';
      
      // Add role if missing
      if (!element.getAttribute('role')) {
        element.setAttribute('role', 'menuitem');
      }
    }
  },

  // Weinschenk: Visual hierarchy, Krug: Scannability
  headings: {
    selector: 'h1, h2, h3, h4, h5, h6, [data-heading]',
    enhance: (element: HTMLElement) => {
      const level = element.tagName.toLowerCase() as 'h1' | 'h2' | 'h3' | 'h4';
      if (['h1', 'h2', 'h3', 'h4'].includes(level)) {
        element.className = enforceTextDesign(level, element.className);
      }
    }
  },

  // General accessibility enhancements (Madzima)
  interactive: {
    selector: '[onclick], [role="button"], .cursor-pointer',
    enhance: (element: HTMLElement) => {
      // Ensure keyboard accessibility
      if (!element.getAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
      }
      
      // Add keyboard event handlers
      if (!element.onkeydown) {
        element.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            element.click();
          }
        });
      }
    }
  },

  // Form labels (Wroblewski: Clear labels)
  labels: {
    selector: 'label',
    enhance: (element: HTMLElement) => {
      element.className = enforceFormDesign('label', element.className);
      
      // Ensure proper association
      const forAttr = element.getAttribute('for');
      if (forAttr) {
        const input = document.getElementById(forAttr);
        if (input && !input.getAttribute('aria-labelledby')) {
          if (!element.id) {
            element.id = `label-${forAttr}`;
          }
          input.setAttribute('aria-labelledby', element.id);
        }
      }
    }
  }
};

// Auto-enhancement observer
class UXAutoEnhancer {
  private observer: MutationObserver;
  private enhancedElements = new WeakSet();

  constructor() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.enhanceElement(node as HTMLElement);
            }
          });
        }
      });
    });
  }

  start() {
    // Enhance existing elements
    this.enhanceAll();
    
    // Watch for new elements
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  stop() {
    this.observer.disconnect();
  }

  private enhanceAll() {
    Object.values(enhancementRules).forEach(rule => {
      const elements = document.querySelectorAll(rule.selector);
      elements.forEach(element => {
        if (element instanceof HTMLElement && !this.enhancedElements.has(element)) {
          this.enhanceElement(element, rule);
        }
      });
    });
  }

  private enhanceElement(element: HTMLElement, specificRule?: any) {
    if (this.enhancedElements.has(element)) return;

    try {
      if (specificRule) {
        specificRule.enhance(element);
      } else {
        // Find matching rules and apply them
        Object.values(enhancementRules).forEach(rule => {
          if (element.matches(rule.selector)) {
            rule.enhance(element);
          }
        });
      }

      // Mark as enhanced
      this.enhancedElements.add(element);
      element.setAttribute('data-ux-enhanced', 'true');

      // Add general transition for smooth interactions (Walter: Delight)
      if (!element.style.transition) {
        element.style.transition = 'all 0.2s ease-out';
      }

    } catch (error) {
      console.warn('UX Enhancement failed for element:', element, error);
    }
  }
}

// Global instance
let autoEnhancer: UXAutoEnhancer | null = null;

// Initialize the auto-enhancer
export function initializeUXAutoEnhancer() {
  if (autoEnhancer) return;
  
  autoEnhancer = new UXAutoEnhancer();
  autoEnhancer.start();
  
  // Log UX principles being applied
  if (process.env.NODE_ENV === 'development') {
    console.log('🎨 UX Auto-Enhancer initialized with principles from:');
    console.log('   • Don Norman: Affordances & Feedback');
    console.log('   • Steve Krug: Clarity & Scannability');
    console.log('   • Luke Wroblewski: Mobile-First Design');
    console.log('   • Aarron Walter: Emotional Hierarchy');
    console.log('   • Jonathan Ive: Purposeful Simplicity');
    console.log('   • Julie Zhuo: Systems Thinking');
    console.log('   • Dieter Rams: Minimal Design');
    console.log('   • Farai Madzima: Inclusive Access');
    console.log('   • Alan Cooper: Goal-Oriented Design');
    console.log('   • Susan Weinschenk: Psychology-Based UX');
  }
}

// Stop the auto-enhancer
export function stopUXAutoEnhancer() {
  if (autoEnhancer) {
    autoEnhancer.stop();
    autoEnhancer = null;
  }
}

// Manual enhancement function for specific elements
export function enhanceElementWithUX(element: HTMLElement, type?: string) {
  if (!autoEnhancer) return;
  
  const rule = type ? enhancementRules[type as keyof typeof enhancementRules] : null;
  if (rule) {
    rule.enhance(element);
  } else {
    // Auto-detect and enhance
    Object.values(enhancementRules).forEach(rule => {
      if (element.matches(rule.selector)) {
        rule.enhance(element);
      }
    });
  }
  
  element.setAttribute('data-ux-enhanced', 'true');
}

// Validation function to check UX compliance
export function validateUXCompliance(element: HTMLElement): string[] {
  const issues: string[] = [];
  
  // Check button affordances (Norman)
  if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
    const styles = getComputedStyle(element);
    if (styles.cursor !== 'pointer') {
      issues.push('Button lacks pointer cursor (Norman: Clear affordances)');
    }
    
    const rect = element.getBoundingClientRect();
    if (rect.height < 44 || rect.width < 44) {
      issues.push('Touch target too small (Wroblewski: Mobile-first)');
    }
  }
  
  // Check accessibility (Madzima)
  if (!element.getAttribute('aria-label') && !element.textContent?.trim()) {
    if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
      issues.push('Button lacks accessible name (Madzima: Inclusive design)');
    }
  }
  
  // Check text readability (Krug)
  if (element.textContent && element.textContent.length > 100) {
    const wordCount = element.textContent.split(' ').length;
    if (wordCount > 15) {
      issues.push('Text may be too long for scanning (Krug: Scannability)');
    }
  }
  
  return issues;
}