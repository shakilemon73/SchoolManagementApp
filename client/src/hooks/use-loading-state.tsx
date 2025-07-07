import { useState, useCallback, useRef, useEffect } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface LoadingStateManager {
  isLoading: (key?: string) => boolean;
  setLoading: (key: string, loading: boolean) => void;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  clearAll: () => void;
  withLoading: <T>(key: string, fn: () => Promise<T>) => Promise<T>;
  loadingStates: LoadingState;
}

export function useLoadingState(): LoadingStateManager {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const setLoading = useCallback((key: string, loading: boolean) => {
    // Clear any existing timeout for this key
    const existingTimeout = timeoutsRef.current.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      timeoutsRef.current.delete(key);
    }

    if (loading) {
      // Set loading immediately
      setLoadingStates(prev => ({ ...prev, [key]: true }));
      
      // Set a maximum timeout to prevent stuck loading states
      const timeout = setTimeout(() => {
        console.warn(`Loading state for "${key}" has been active for more than 30 seconds`);
        setLoadingStates(prev => ({ ...prev, [key]: false }));
        timeoutsRef.current.delete(key);
      }, 30000);
      
      timeoutsRef.current.set(key, timeout);
    } else {
      // Stop loading
      setLoadingStates(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  }, []);

  const startLoading = useCallback((key: string) => {
    setLoading(key, true);
  }, [setLoading]);

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false);
  }, [setLoading]);

  const isLoading = useCallback((key?: string) => {
    if (key) {
      return loadingStates[key] || false;
    }
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  const clearAll = useCallback(() => {
    // Clear all timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();
    
    setLoadingStates({});
  }, []);

  const withLoading = useCallback(async <T,>(key: string, fn: () => Promise<T>): Promise<T> => {
    try {
      startLoading(key);
      const result = await fn();
      return result;
    } catch (error) {
      throw error;
    } finally {
      stopLoading(key);
    }
  }, [startLoading, stopLoading]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  return {
    isLoading,
    setLoading,
    startLoading,
    stopLoading,
    clearAll,
    withLoading,
    loadingStates
  };
}

// Global loading state context for app-wide loading management
import { createContext, useContext, ReactNode } from 'react';

const LoadingContext = createContext<LoadingStateManager | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const loadingManager = useLoadingState();
  
  return (
    <LoadingContext.Provider value={loadingManager}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useGlobalLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useGlobalLoading must be used within a LoadingProvider');
  }
  return context;
}

// Loading spinner component with built-in state management
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

// Loading overlay component
interface LoadingOverlayProps {
  loading: boolean;
  text?: string;
  children: ReactNode;
}

export function LoadingOverlay({ loading, text, children }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <LoadingSpinner text={text} />
        </div>
      )}
    </div>
  );
}