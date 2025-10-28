import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import '../components/auth/AuthForm.css';

const RegisterPage = () => {
  const navigate = useNavigate();

  const handleRegisterSuccess = (response) => {
    console.log('Registration successful, redirecting to login...');
    // Redirect to login page after successful registration
    navigate('/login');
  };

  return (
    <div className="auth-page register-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>Join Vendly Today</h2>
          <p>Create your account and start your journey</p>
          
          <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
          
          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;