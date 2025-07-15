import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../contexts/MessageContext';
import { useAuthNavigation } from '../hooks/useAuthNavigation';
import { VerifyOtpContext } from '../App';

const Register = ({ setCanVerifyOtp }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const { showMessage } = useMessage();
    const navigate = useNavigate();
    const { shouldRedirectToDashboard } = useAuthNavigation();
    const verifyOtpCtx = useContext(VerifyOtpContext);

    // Redirect if already authenticated
    useEffect(() => {
        if (shouldRedirectToDashboard()) {
            navigate('/dashboard', { replace: true });
        }
    }, [shouldRedirectToDashboard, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        if (formData.password.length < 8) {
            showMessage('Password must be at least 8 characters long', 'error');
            return;
        }

        setLoading(true);

        try {
            const result = await register(formData);
            if (result.success) {
                if (setCanVerifyOtp) setCanVerifyOtp(true);
                if (verifyOtpCtx) verifyOtpCtx.setCanVerifyOtp(true);
                showMessage('Registration successful! Please verify your email.', 'success');
                navigate('/verify-otp', { state: { email: result.email } });
            }
        } catch (error) {
            if (setCanVerifyOtp) setCanVerifyOtp(false);
            if (verifyOtpCtx) verifyOtpCtx.setCanVerifyOtp(false);
            showMessage(error.message || 'Registration failed', 'error');
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
                        <h1>CREATE VAULTIFY ACCOUNT</h1>
                        <p>SECURE PASSWORD MANAGEMENT FOR ENTERPRISES</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form" style={{ marginBottom: '32px' }}>
                        <div className="form-group" style={{ marginBottom: '32px' }}>
                            <label htmlFor="name" className="form-label">
                                FULL NAME
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="ENTER YOUR FULL NAME"
                                required
                            />
                        </div>

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
                                    placeholder="CREATE YOUR MASTER PASSWORD"
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
                            <div className="password-requirements">
                                <span>MINIMUM 8 CHARACTERS</span>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '32px' }}>
                            <label htmlFor="confirmPassword" className="form-label">
                                CONFIRM PASSWORD
                            </label>
                            <div className="password-input-group">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="CONFIRM YOUR MASTER PASSWORD"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirmPassword ? 'HIDE' : 'SHOW'}
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
                                        <span>CREATING ACCOUNT...</span>
                                    </>
                                ) : (
                                    <span>CREATE ACCOUNT</span>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="auth-links" style={{ gap: '24px', marginBottom: '32px', paddingTop: '32px' }}>
                        <Link to="/login" className="auth-link" style={{ textDecoration: 'none !important' }}>
                            ALREADY HAVE AN ACCOUNT?
                        </Link>
                    </div>

                    <div className="auth-footer" style={{ paddingTop: '32px' }}>
                        <div className="security-notice">
                            <span>ZERO-KNOWLEDGE ARCHITECTURE • AES-256 ENCRYPTION</span>
                        </div>
                        <div className="terms-notice">
                            <span>BY CREATING AN ACCOUNT, YOU AGREE TO OUR </span>
                            <Link to="/terms-of-service" style={{ textDecoration: 'none !important' }}>TERMS OF SERVICE</Link>
                            <span> AND </span>
                            <Link to="/privacy-policy" style={{ textDecoration: 'none !important' }}>PRIVACY POLICY</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register; 