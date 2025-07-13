import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../contexts/MessageContext';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const { forgotPassword } = useAuth();
    const { showMessage } = useMessage();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            showMessage('Please enter your email address', 'error');
            return;
        }

        setLoading(true);
        try {
            const result = await forgotPassword(email);
            if (result.success) {
                showMessage('Password reset OTP sent to your email', 'success');
                navigate('/reset-password', { state: { email } });
            }
        } catch (error) {
            showMessage(error.message || 'Failed to send reset link', 'error');
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
                        <h1>FORGOT PASSWORD</h1>
                        <p>ENTER YOUR EMAIL TO RECEIVE A PASSWORD RESET OTP</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form" style={{ marginBottom: '32px' }}>
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

                        <div className="form-actions" style={{ marginTop: '40px' }}>
                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={loading || !email.trim()}
                            >
                                {loading ? (
                                    <>
                                        <div className="pixelated-spinner">
                                            <div className="pixel"></div>
                                            <div className="pixel"></div>
                                            <div className="pixel"></div>
                                            <div className="pixel"></div>
                                        </div>
                                        <span>SENDING...</span>
                                    </>
                                ) : (
                                    <span>SEND OTP EMAIL</span>
                                )}
                            </button>
                        </div>
                    </form>

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

export default ForgotPassword; 