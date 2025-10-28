import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AuthForm.css';

const RegisterForm = ({ onRegisterSuccess }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    user_type: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleUserTypeChange = (type) => {
    setFormData({
      ...formData,
      user_type: type
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...submitData } = formData;
      const response = await register(submitData);
      console.log('Registration successful:', response);
      if (onRegisterSuccess) {
        onRegisterSuccess(response);
      }
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="full_name">Full Name</label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          placeholder="John Doe"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          minLength={6}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          required
          minLength={6}
        />
      </div>
      
      <div className="form-group">
        <label>I want to join as</label>
        <div className="user-type-selector">
          <div className="user-type-option">
            <input
              type="radio"
              id="customer"
              name="user_type"
              value="customer"
              checked={formData.user_type === 'customer'}
              onChange={(e) => handleUserTypeChange(e.target.value)}
            />
            <label htmlFor="customer" className="user-type-label">
              <span className="user-type-icon">🛍️</span>
              <span className="user-type-text">Customer</span>
            </label>
          </div>
          
          <div className="user-type-option">
            <input
              type="radio"
              id="vendor"
              name="user_type"
              value="vendor"
              checked={formData.user_type === 'vendor'}
              onChange={(e) => handleUserTypeChange(e.target.value)}
            />
            <label htmlFor="vendor" className="user-type-label">
              <span className="user-type-icon">🏪</span>
              <span className="user-type-text">Vendor</span>
            </label>
          </div>
        </div>
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span>
            Creating Account...
          </>
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  );
};

export default RegisterForm;