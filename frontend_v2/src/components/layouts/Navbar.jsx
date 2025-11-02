import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Gavel } from "lucide-react";
import Button from "../ui/Button";

/**
 * Navbar Component - Minimalist, responsive navigation
 *
 * Features:
 * - Sticky on scroll
 * - Mobile hamburger menu
 * - Authentication state aware (placeholder for now)
 * - Clean, minimal design
 */
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // TODO: Replace with actual auth state from AuthContext
  const isAuthenticated = false;
  const userRole = null; // 'admin', 'client', 'participant'

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <Gavel className="w-7 h-7 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Vendly</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/auctions"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              Auctions
            </Link>
            <Link
              to="/how-it-works"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              How It Works
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Button variant="ghost" size="sm">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-primary-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-fade-in">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/auctions"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Auctions
            </Link>
            <Link
              to="/how-it-works"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              How It Works
            </Link>

            <div className="pt-3 border-t border-gray-200 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="block">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block">
                    <Button variant="ghost" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" className="block">
                    <Button variant="primary" size="sm" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
