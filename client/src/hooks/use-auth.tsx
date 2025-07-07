/**
 * Authentication module for the application.
 * 
 * This module provides authentication functionality including:
 * - User authentication state management
 * - Login, logout, and registration mutations
 * - Authentication context provider
 */
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { supabase, auth } from "@/lib/supabase";

/**
 * Authentication context type definition.
 * Contains all the authentication-related state and mutations.
 */
type AuthContextType = {
  /** Current authenticated user or null if not authenticated */
  user: SelectUser | null;
  /** Loading state for authentication */
  isLoading: boolean;
  /** Error object if authentication failed */
  error: Error | null;
  /** Mutation for logging in a user */
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  /** Mutation for logging out the current user */
  logoutMutation: UseMutationResult<void, Error, void>;
  /** Mutation for registering a new user */
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

/**
 * Login data type definition.
 * Contains the username and password fields required for login.
 */
type LoginData = Pick<InsertUser, "username" | "password">;

/**
 * Authentication context used for providing authentication state
 * throughout the application.
 */
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Authentication Provider component.
 * 
 * Wraps your application to provide authentication functionality
 * to all child components.
 * 
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <YourApp />
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Query for fetching the current user
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  /**
   * Login mutation for authenticating a user.
   * 
   * @example
   * ```tsx
   * const { loginMutation } = useAuth();
   * 
   * const handleLogin = () => {
   *   loginMutation.mutate({
   *     username: "user123",
   *     password: "password123"
   *   });
   * };
   * ```
   */
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      const user = await res.json();
      console.log("Login successful:", user);
      return user;
    },
    onSuccess: (user: SelectUser) => {
      console.log("Setting user data in cache:", user);
      // Update the cache with the user data
      queryClient.setQueryData(["/api/user"], user);
      // Invalidate the query to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      // Display error message to the user
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  /**
   * Registration mutation for creating a new user account.
   * 
   * @example
   * ```tsx
   * const { registerMutation } = useAuth();
   * 
   * const handleRegister = () => {
   *   registerMutation.mutate({
   *     username: "newuser",
   *     password: "password123",
   *     fullName: "New User",
   *     email: "user@example.com",
   *     role: "teacher"
   *   });
   * };
   * ```
   */
  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      const user = await res.json();
      console.log("Registration successful:", user);
      return user;
    },
    onSuccess: (user: SelectUser) => {
      console.log("Setting user data in cache after registration:", user);
      // Update the cache with the new user data
      queryClient.setQueryData(["/api/user"], user);
      // Invalidate the query to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
      // Display error message to the user
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  /**
   * Logout mutation for signing out the current user.
   * 
   * @example
   * ```tsx
   * const { logoutMutation } = useAuth();
   * 
   * const handleLogout = () => {
   *   logoutMutation.mutate();
   * };
   * ```
   */
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      // Clear the user data from cache
      queryClient.setQueryData(["/api/user"], null);
    },
    onError: (error: Error) => {
      // Display error message to the user
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook for accessing authentication functionality throughout the application.
 * 
 * @returns {AuthContextType} Authentication context containing user data and auth mutations
 * @throws {Error} If used outside of an AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}