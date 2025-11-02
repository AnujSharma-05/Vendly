import React from "react";

/**
 * Reusable Input Component
 *
 * @param {string} label - Input label text
 * @param {string} type - Input type: 'text', 'email', 'password', 'number', etc.
 * @param {string} error - Error message to display
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Mark field as required
 * @param {string} className - Additional CSS classes
 */
const Input = React.forwardRef(
  (
    {
      label,
      type = "text",
      error,
      placeholder,
      required = false,
      className = "",
      ...props
    },
    ref
  ) => {
    // Base input styles
    const inputStyles = `
    w-full px-4 py-2 border rounded-lg 
    bg-white text-gray-900 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    transition-all duration-200
    ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300"}
    ${className}
  `;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={inputStyles}
          {...props}
        />

        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
