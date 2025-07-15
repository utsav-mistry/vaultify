import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Reactivate = () => {
    const [status, setStatus] = useState('pending');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (!token) {
            setStatus('error');
            setMessage('Missing reactivation token.');
            return;
        }
        fetch(`${process.env.REACT_APP_API_URL || ''}/api/users/reactivate?token=${token}`)
            .then(res => res.json())
            .then(data => {
                if (data.message) {
                    setStatus('success');
                    setMessage(data.message);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Reactivation failed.');
                }
            })
            .catch(() => {
                setStatus('error');
                setMessage('Reactivation failed. Please try again later.');
            });
    }, []);

    return (
        <div className="auth-page" style={{ background: '#fff', minHeight: '100vh', padding: '40px 0' }}>
            <div className="auth-container" style={{ padding: '0 24px' }}>
                <div className="auth-card" style={{ padding: '40px', maxWidth: 400, margin: '0 auto', textAlign: 'center', background: '#fff', border: '2px solid #000', borderRadius: 0, boxShadow: 'none' }}>
                    <div className="auth-header" style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '2px solid #000' }}>
                        <Link to="/" className="back-link" style={{ textDecoration: 'none !important', color: '#000', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                            BACK TO HOME
                        </Link>
                        <h1 style={{ color: '#000', marginTop: 24, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: 28 }}>Account Reactivation</h1>
                    </div>
                    {status === 'pending' && (
                        <div style={{ margin: '32px 0' }}>
                            <div className="pixelated-spinner" style={{ color: '#000', margin: '0 auto' }}>
                                <div className="pixel"></div>
                                <div className="pixel"></div>
                                <div className="pixel"></div>
                                <div className="pixel"></div>
                                <div className="pixel"></div>
                                <div className="pixel"></div>
                                <div className="pixel"></div>
                                <div className="pixel"></div>
                            </div>
                            <div className="loading-text" style={{ color: '#222', fontWeight: 600, marginTop: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Processing your reactivation...</div>
                        </div>
                    )}
                    {status !== 'pending' && (
                        <div style={{ color: '#000', fontSize: 18, margin: '32px 0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{message}</div>
                    )}
                    <div style={{ marginTop: 32 }}>
                        <Link to="/login" className="btn btn-primary btn-block" style={{ background: '#000', color: '#fff', border: '2px solid #000', borderRadius: 0, fontWeight: 700, padding: '12px 0', fontSize: 16, width: '100%', textDecoration: 'none', letterSpacing: 1, textTransform: 'uppercase' }}>
                            Go to Login
                        </Link>
                    </div>
                    <div className="auth-footer" style={{ paddingTop: '32px' }}>
                        <div className="security-notice" style={{ color: '#222', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginTop: 32 }}>
                            <span>ALL DATA IS ENCRYPTED WITH AES-256</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reactivate; 