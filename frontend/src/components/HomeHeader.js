import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthNavigation } from '../hooks/useAuthNavigation';

const HomeHeader = () => {
    const { user, loading } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { navigateToDashboard, navigateToLogin, navigateToRegister } = useAuthNavigation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setIsVisible(scrollTop > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`home-header ${isVisible ? 'visible' : ''}`}>
            <div className="container">
                <div className="home-header-content">
                    <div className="home-header-left">
                        <Link to="/" className="home-logo">
                            <span className="logo-text">VAULTIFY</span>
                        </Link>
                    </div>

                    <div className="home-header-right">
                        <nav className="home-nav" style={{ textDecoration: 'none' }}>
                            <Link to="/" className="home-nav-link">HOME</Link>
                            <Link to="/version" className="home-nav-link">VERSION</Link>
                            <Link to="/privacy-policy" className="home-nav-link">PRIVACY</Link>
                            <Link to="/terms-of-service" className="home-nav-link">TERMS</Link>
                        </nav>

                        <div className="home-header-actions">
                            <div className="auth-buttons">
                                {user && !loading ? (
                                    <button onClick={navigateToDashboard} className="btn btn-primary">
                                        <span>
    
                                            ACCESS DASHBOARD
                                        </span>
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={navigateToLogin} className="btn btn-secondary">
                                            <span>
                                                LOGIN
                                            </span>
                                        </button>
                                        <button onClick={navigateToRegister} className="btn btn-primary">
                                            <span>
                                                SIGN UP
                                            </span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default HomeHeader; 