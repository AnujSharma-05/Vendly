import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import '../components/auth/AuthForm.css';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = (response) => {
    console.log('Login successful, redirecting...');
    // Redirect to home page after successful login
    navigate('/');
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>Welcome Back</h2>
          <p>Sign in to your Vendly account</p>
          
          <LoginForm onLoginSuccess={handleLoginSuccess} />
          
          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;