import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../contexts/MessageContext';
import OTPInput from '../components/OTPInput';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { resetPassword } = useAuth();
    const { showMessage } = useMessage();

    // Get email from location state if passed from ForgotPassword
    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        }
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            showMessage('Please enter your email address', 'error');
            return;
        }

        if (!otp.trim()) {
            showMessage('Please enter the OTP code', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage('Password must be at least 6 characters long', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        setLoading(true);
        try {
            const result = await resetPassword(email, otp, password);
            if (result.success) {
                showMessage('Password reset successfully!', 'success');
                navigate('/login');
            }
        } catch (error) {
            showMessage(error.message || 'Failed to reset password', 'error');
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
                        <h1>CHECK YOUR EMAIL</h1>
                        <p>PASSWORD RESET OTP SENT TO {email?.toUpperCase() || 'YOUR EMAIL'}</p>
                    </div>

                    <div className="auth-content" style={{ marginBottom: '32px' }}>
                        <div className="success-message" style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <h3 style={{ marginBottom: '16px' }}>OTP SENT</h3>
                            <p style={{ marginBottom: '24px' }}>Enter the OTP code from your email to reset your password. The code will expire in 5 minutes.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form" style={{ marginBottom: '32px' }}>
                            {!location.state?.email && (
                                <div className="form-group" style={{ marginBottom: '32px' }}>
                                    <label htmlFor="email" className="form-label">
                                        EMAIL ADDRESS
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="form-input"
                                        placeholder="ENTER YOUR EMAIL"
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-group" style={{ marginBottom: '32px' }}>
                                <label className="form-label" style={{ marginBottom: '16px', display: 'block' }}>
                                    OTP CODE
                                </label>
                                <OTPInput
                                    value={otp}
                                    onChange={setOtp}
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '32px' }}>
                                <label htmlFor="password" className="form-label">
                                    NEW MASTER PASSWORD
                                </label>
                                <div className="password-input-group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="form-input"
                                        placeholder="ENTER YOUR NEW MASTER PASSWORD"
                                        required
                                        minLength={6}
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

                            <div className="form-group" style={{ marginBottom: '32px' }}>
                                <label htmlFor="confirmPassword" className="form-label">
                                    CONFIRM MASTER PASSWORD
                                </label>
                                <div className="password-input-group">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="form-input"
                                        placeholder="CONFIRM YOUR NEW MASTER PASSWORD"
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
                                    disabled={loading || !email || !otp || !password || !confirmPassword || password !== confirmPassword}
                                >
                                    {loading ? (
                                        <>
                                            <div className="pixelated-spinner">
                                                <div className="pixel"></div>
                                                <div className="pixel"></div>
                                                <div className="pixel"></div>
                                                <div className="pixel"></div>
                                            </div>
                                            <span>RESETTING...</span>
                                        </>
                                    ) : (
                                        <span>RESET PASSWORD</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="auth-links" style={{ gap: '24px', marginBottom: '32px', paddingTop: '32px' }}>
                        <Link to="/login" className="auth-link" style={{ textDecoration: 'none !important' }}>
                            BACK TO LOGIN
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

export default ResetPassword; 