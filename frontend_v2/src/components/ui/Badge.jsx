import React from "react";

/**
 * Reusable Badge Component for status indicators
 *
 * @param {string} variant - Badge style: 'success', 'warning', 'error', 'info', 'default'
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} children - Badge content
 */
const Badge = ({ children, variant = "default", className = "", ...props }) => {
  // Base styles (applied to all badges)
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  // Variant styles
  const variants = {
    success: "bg-green-100 text-green-800",
    warning: "bg-amber-100 text-amber-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    default: "bg-gray-100 text-gray-800",
  };

  // Combine all styles
  const badgeClasses = `${baseStyles} ${variants[variant]} ${className}`;

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};

export default Badge;
