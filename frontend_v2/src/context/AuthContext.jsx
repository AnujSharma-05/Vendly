import React, { createContext, useContext, useState, useEffect } from "react";
import authAPI from "../api/authAPI";

/**
 * Auth Context - Manages authentication state across the app
 *
 * Provides:
 * - user: Current user data
 * - isAuthenticated: Boolean auth status
 * - isLoading: Loading state during auth operations
 * - login: Login function
 * - register: Register function
 * - logout: Logout function
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("access_token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          // Verify token is still valid by fetching user data
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalid or expired
          console.error("Token validation failed:", error);
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Login user
   * @param {string} username_or_email - Username or email
   * @param {string} password - Password
   * @param {boolean} rememberMe - Keep user logged in
   */
  const login = async (username_or_email, password, rememberMe = false) => {
    try {
      const response = await authAPI.login({ username_or_email, password });

      // Store token
      if (rememberMe) {
        localStorage.setItem("access_token", response.access_token);
      } else {
        sessionStorage.setItem("access_token", response.access_token);
      }

      // Fetch full user profile
      const userData = await authAPI.getCurrentUser();

      // Store user data
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        error: error.response?.data?.detail || "Invalid username or password",
      };
    }
  };

  /**
   * Register new user
   * @param {Object} userData - Registration data
   */
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);

      // Auto-login after successful registration
      const loginResult = await login(
        userData.username,
        userData.password,
        false
      );

      return { success: true, user: response, loginResult };
    } catch (error) {
      console.error("Registration failed:", error);
      return {
        success: false,
        error:
          error.response?.data?.detail ||
          "Registration failed. Please try again.",
      };
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    authAPI.logout();
    sessionStorage.removeItem("access_token");
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
