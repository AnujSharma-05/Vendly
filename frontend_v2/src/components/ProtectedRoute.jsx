import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute - Wrapper for routes that require authentication
 *
 * @param {React.ReactNode} children - Component to render if authenticated
 * @param {string[]} allowedRoles - Array of roles that can access this route
 * @param {string} redirectTo - Path to redirect if not authenticated
 */
const ProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectTo = "/login",
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0 && user) {
    const hasAccess = allowedRoles.includes(user.role);
    if (!hasAccess) {
      // Redirect to appropriate dashboard based on user role
      const roleRedirects = {
        admin: "/admin/dashboard",
        client: "/client/dashboard",
        participant: "/dashboard",
      };
      return <Navigate to={roleRedirects[user.role] || "/"} replace />;
    }
  }

  // Render protected component
  return children;
};

export default ProtectedRoute;
