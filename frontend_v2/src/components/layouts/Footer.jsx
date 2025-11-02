import React from "react";
import { Gavel } from "lucide-react";

/**
 * Footer Component - Minimal and clean
 *
 * Features:
 * - Brand section with logo
 * - Quick links
 * - Copyright notice
 * - Responsive layout
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Brand Section */}
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-2 mb-2">
              <Gavel className="w-6 h-6 text-primary-600" />
              <span className="text-lg font-bold text-gray-900">Vendly</span>
            </div>
            <p className="text-sm text-gray-600">
              Real-time auctions, fair bidding, transparent process.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/auctions"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Browse Auctions
                </a>
              </li>
              <li>
                <a
                  href="/how-it-works"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/help"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-gray-200">
          <p className="text-sm text-center text-gray-600">
            © {currentYear} Vendly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
