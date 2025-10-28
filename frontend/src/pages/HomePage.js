import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../components/auth/AuthForm.css';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content fade-in">
            <h1 className="hero-title">
              Welcome to <span className="text-gradient">Vendly</span>
            </h1>
            <p className="hero-subtitle">
              Your trusted marketplace connecting customers with verified vendors worldwide
            </p>
            
            {!isAuthenticated && (
              <div className="cta-buttons">
                <Link to="/register" className="btn btn-primary">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title text-center">Why Choose Vendly?</h2>
          <p className="section-subtitle text-center">
            Everything you need to buy or sell with confidence
          </p>
          
          <div className="features-grid">
            <div className="feature-card card fade-in">
              <div className="feature-icon">🛍️</div>
              <h3>For Customers</h3>
              <p>Discover amazing products from verified vendors and local businesses. Shop with confidence and get the best deals.</p>
            </div>
            
            <div className="feature-card card fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="feature-icon">🏪</div>
              <h3>For Vendors</h3>
              <p>Showcase your products to a global audience. Manage your inventory, track orders, and grow your business.</p>
            </div>
            
            <div className="feature-card card fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="feature-icon">🔒</div>
              <h3>Secure & Reliable</h3>
              <p>Enterprise-grade security, encrypted transactions, and 24/7 support. Your data and transactions are safe with us.</p>
            </div>
            
            <div className="feature-card card fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="feature-icon">⚡</div>
              <h3>Fast & Easy</h3>
              <p>Quick registration, intuitive interface, and seamless checkout. Start buying or selling in minutes.</p>
            </div>
            
            <div className="feature-card card fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="feature-icon">🌍</div>
              <h3>Global Reach</h3>
              <p>Connect with buyers and sellers from around the world. Expand your market beyond borders.</p>
            </div>
            
            <div className="feature-card card fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="feature-icon">💎</div>
              <h3>Quality Assured</h3>
              <p>Every vendor is verified and reviewed. We maintain high standards to ensure quality products and services.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="cta-section">
          <div className="container">
            <div className="cta-card card-gradient">
              <h2>Ready to get started?</h2>
              <p>Join thousands of customers and vendors already using Vendly</p>
              <div className="cta-buttons">
                <Link to="/register" className="btn btn-primary">
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3 className="text-gradient">Vendly</h3>
              <p>Connecting buyers and sellers worldwide</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#about">About Us</a>
                <a href="#careers">Careers</a>
                <a href="#press">Press</a>
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <a href="#help">Help Center</a>
                <a href="#contact">Contact Us</a>
                <a href="#faq">FAQ</a>
              </div>
              <div className="footer-column">
                <h4>Legal</h4>
                <a href="#terms">Terms of Service</a>
                <a href="#privacy">Privacy Policy</a>
                <a href="#cookies">Cookie Policy</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Vendly. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      <style jsx>{`
        .home-page {
          background: var(--background);
        }

        .hero-section {
          min-height: 600px;
          display: flex;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          position: relative;
          overflow: hidden;
          padding: 4rem 0;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
        }

        .hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          color: white;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          color: white;
        }

        .hero-title .text-gradient {
          background: linear-gradient(135deg, #fff 0%, #f093fb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.5rem;
          margin-bottom: 3rem;
          color: rgba(255, 255, 255, 0.95);
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .features-section {
          padding: 6rem 0;
        }

        .section-title {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .section-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 4rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          text-align: center;
          padding: 2.5rem 2rem;
        }

        .feature-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }

        .feature-card h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .feature-card p {
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 0;
        }

        .cta-section {
          padding: 6rem 0;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(240, 147, 251, 0.05) 100%);
        }

        .cta-card {
          text-align: center;
          padding: 4rem 2rem;
        }

        .cta-card h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .cta-card p {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 2.5rem;
        }

        .footer {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          padding: 4rem 0 2rem;
        }

        .footer-content {
          display: grid;
          grid-template-columns: 2fr 3fr;
          gap: 4rem;
          margin-bottom: 3rem;
        }

        .footer-brand h3 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .footer-brand p {
          color: rgba(255, 255, 255, 0.7);
        }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .footer-column h4 {
          margin-bottom: 1rem;
          color: white;
        }

        .footer-column a {
          display: block;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          margin-bottom: 0.75rem;
          transition: color 0.2s ease;
        }

        .footer-column a:hover {
          color: white;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 2rem;
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1.125rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .footer-links {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;