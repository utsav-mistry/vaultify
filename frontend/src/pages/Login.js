import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../contexts/MessageContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showMessage } = useMessage();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting login with:', formData);
      const result = await login(formData);
      console.log('Login result:', result);

      if (result.success) {
        showMessage('Login successful', 'success');
        console.log('Login successful, navigating to dashboard');
        navigate('/dashboard');
      } else {
        console.log('Login failed:', result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      showMessage(error.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ padding: '40px 0' }}>
      <div className="auth-container" style={{ padding: '0 24px' }}>
        <div className="auth-card" style={{ padding: '40px' }}>
          <div className="auth-header" style={{ marginBottom: '32px', paddingBottom: '32px' }}>
            <Link to="/" className="back-link" style={{ textDecoration: 'none !important' }}>
              BACK TO HOME
            </Link>
            <h1>SIGN IN TO VAULTIFY</h1>
            <p>SECURE ACCESS TO YOUR PASSWORD VAULT</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" style={{ marginBottom: '32px' }}>
            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label htmlFor="email" className="form-label">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="ENTER YOUR EMAIL"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label htmlFor="password" className="form-label">
                MASTER PASSWORD
              </label>
              <div className="password-input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="ENTER YOUR MASTER PASSWORD"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '40px' }}>
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="pixelated-spinner">
                      <div className="pixel"></div>
                      <div className="pixel"></div>
                      <div className="pixel"></div>
                      <div className="pixel"></div>
                    </div>
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <span>SIGN IN</span>
                )}
              </button>
            </div>
          </form>

          <div className="auth-links" style={{ gap: '24px', marginBottom: '32px', paddingTop: '32px' }}>
            <Link to="/forgot-password" className="auth-link" style={{ textDecoration: 'none !important' }}>
              FORGOT PASSWORD?
            </Link>
            <Link to="/register" className="auth-link" style={{ textDecoration: 'none !important' }}>
              CREATE ACCOUNT
            </Link>
          </div>

          <div className="auth-footer" style={{ paddingTop: '32px' }}>
            <div className="security-notice">
              <span>ALL DATA IS ENCRYPTED WITH AES-256</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 