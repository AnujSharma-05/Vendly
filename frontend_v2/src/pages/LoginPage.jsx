import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Gavel } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

/**
 * Login Page - Clean authentication form
 *
 * Features:
 * - Split-screen design (form on right, illustration on left - hidden on mobile)
 * - Username or Email input (single field)
 * - Password with show/hide toggle
 * - Remember me checkbox
 * - Loading state
 * - Link to register page
 * - Responsive design
 */
const LoginPage = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // TODO: Replace with actual API call
    setTimeout(() => {
      console.log("Login attempt:", formData);
      setIsLoading(false);
      // Simulate error for demo
      // setError('Invalid username or password');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center mb-6">
            <Gavel className="w-16 h-16 text-black" />
          </div>
          <h2 className="text-4xl font-bold text-black mb-4">
            Welcome Back to Vendly
          </h2>
          <p className="text-primary-100 text-lg">
            Sign in to access live auctions, manage your bids, and explore new
            opportunities.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="flex items-center justify-center mb-8 lg:hidden">
            <Gavel className="w-10 h-10 text-primary-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">Vendly</span>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Log In</h1>
            <p className="text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username or Email */}
            <Input
              label="Username or Email"
              type="text"
              name="usernameOrEmail"
              placeholder="Enter your username or email"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              required
            />

            {/* Password with Toggle */}
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <a
                href="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
