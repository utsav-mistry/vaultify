import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../contexts/MessageContext';
import OTPInput from '../components/OTPInput';
import { VerifyOtpContext } from '../App';

const VerifyOTP = ({ setCanVerifyOtp }) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyOTP, resendOTP } = useAuth();
    const { showMessage } = useMessage();
    const verifyOtpCtx = useContext(VerifyOtpContext);

    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/register');
            return;
        }

        // Start resend timer
        setResendTimer(60);
        const timer = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (otp.length !== 6) {
            showMessage('Please enter the complete 6-digit OTP', 'error');
            return;
        }

        setLoading(true);
        try {
            const result = await verifyOTP(email, otp);
            if (result.success) {
                if (setCanVerifyOtp) setCanVerifyOtp(false);
                if (verifyOtpCtx) verifyOtpCtx.setCanVerifyOtp(false);
                showMessage('Email verified successfully!', 'success');
                navigate('/login');
            }
        } catch (error) {
            if (setCanVerifyOtp) setCanVerifyOtp(false);
            if (verifyOtpCtx) verifyOtpCtx.setCanVerifyOtp(false);
            showMessage(error.message || 'Failed to verify OTP', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;

        setLoading(true);
        try {
            await resendOTP(email);
            showMessage('OTP resent successfully!', 'success');
            setResendTimer(60);
        } catch (error) {
            showMessage(error.message || 'Failed to resend OTP', 'error');
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
                        <h1>VERIFY YOUR EMAIL</h1>
                        <p>WE'VE SENT A 6-DIGIT CODE TO {email?.toUpperCase()}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form" style={{ marginBottom: '32px' }}>
                        <div className="form-group" style={{ marginBottom: '32px' }}>
                            <label className="form-label" style={{ marginBottom: '16px', display: 'block' }}>
                                ENTER OTP CODE
                            </label>
                            <OTPInput
                                value={otp}
                                onChange={setOtp}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-actions" style={{ marginTop: '40px' }}>
                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={loading || otp.length !== 6}
                                style={{
                                    height: '48px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase'
                                }}
                            >
                                {loading ? (
                                    <>
                                        <div className="pixelated-spinner">
                                            <div className="pixel"></div>
                                            <div className="pixel"></div>
                                            <div className="pixel"></div>
                                            <div className="pixel"></div>
                                        </div>
                                        <span>VERIFYING...</span>
                                    </>
                                ) : (
                                    <span>VERIFY EMAIL</span>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="auth-footer" style={{ paddingTop: '32px' }}>
                        <p style={{ marginBottom: '16px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted, #666)' }}>
                            DIDN'T RECEIVE THE CODE?
                        </p>
                        <button
                            type="button"
                            className="btn btn-link"
                            onClick={handleResendOTP}
                            disabled={resendTimer > 0 || loading}
                            style={{
                                marginBottom: '16px',
                                width: '100%',
                                height: '40px',
                                fontSize: '12px',
                                fontWeight: '600',
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted, #666)',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: resendTimer > 0 || loading ? 'not-allowed' : 'pointer',
                                opacity: resendTimer > 0 || loading ? 0.5 : 1
                            }}
                        >
                            {resendTimer > 0
                                ? `RESEND IN ${resendTimer}S`
                                : 'RESEND OTP'
                            }
                        </button>

                        <div className="auth-links" style={{ gap: '24px', marginBottom: '32px', paddingTop: '32px' }}>
                            <Link to="/register" className="auth-link" style={{ textDecoration: 'none !important' }}>
                                BACK TO REGISTER
                            </Link>
                            <Link to="/login" className="auth-link" style={{ textDecoration: 'none !important' }}>
                                BACK TO LOGIN
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP; 