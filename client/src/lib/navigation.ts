import { useLocation } from 'wouter';

export interface NavigationState {
  canGoBack: boolean;
  previousPath: string | null;
}

// Simple navigation history management
class NavigationHistory {
  private history: string[] = [];
  private maxHistorySize = 50;

  addPath(path: string) {
    // Don't add the same path consecutively
    if (this.history[this.history.length - 1] !== path) {
      this.history.push(path);
      
      // Keep history size manageable
      if (this.history.length > this.maxHistorySize) {
        this.history = this.history.slice(-this.maxHistorySize);
      }
    }
  }

  getPreviousPath(): string | null {
    // Return the path before the current one
    return this.history.length >= 2 ? this.history[this.history.length - 2] : null;
  }

  canGoBack(): boolean {
    return this.history.length >= 2;
  }

  goBack(): string | null {
    if (this.canGoBack()) {
      // Remove current path and return to previous
      this.history.pop();
      return this.history[this.history.length - 1];
    }
    return null;
  }

  getCurrentPath(): string | null {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }

  clear() {
    this.history = [];
  }
}

export const navigationHistory = new NavigationHistory();

export function useNavigation() {
  const [location, setLocation] = useLocation();

  const goBack = () => {
    const previousPath = navigationHistory.goBack();
    if (previousPath) {
      setLocation(previousPath);
    } else {
      // Fallback to dashboard if no history
      setLocation('/');
    }
  };

  const navigateTo = (path: string) => {
    navigationHistory.addPath(location);
    setLocation(path);
  };

  const canGoBack = () => {
    return navigationHistory.canGoBack();
  };

  return {
    location,
    goBack,
    navigateTo,
    canGoBack,
    setLocation
  };
}

// Initialize navigation tracking
export function initializeNavigation() {
  // Add current path to history on page load
  const currentPath = window.location.pathname;
  navigationHistory.addPath(currentPath);
}