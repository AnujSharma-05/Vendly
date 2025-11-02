import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Reusable Button Component
 *
 * @param {string} variant - Button style: 'primary', 'secondary', 'danger', 'ghost'
 * @param {string} size - Button size: 'sm', 'md', 'lg'
 * @param {boolean} isLoading - Show loading spinner
 * @param {boolean} disabled - Disable button
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} children - Button content
 */
const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  className = "",
  ...props
}) => {
  // Base styles (applied to all buttons)
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  // Variant styles
  const variants = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800 shadow-md hover:shadow-lg",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400 active:bg-gray-400 shadow-sm",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800 shadow-md hover:shadow-lg",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
  };

  // Size styles
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  // Combine all styles
  const buttonClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
