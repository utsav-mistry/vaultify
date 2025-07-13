import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthNavigation } from '../hooks/useAuthNavigation';

const Home = () => {
    const { isAuthenticated, navigateToDashboard, navigateToLogin, navigateToRegister } = useAuthNavigation();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                } else {
                    // Remove animation class when element is out of view
                    entry.target.classList.remove('animate');
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll('.scroll-animate');
        animatedElements.forEach((el, index) => {
            el.style.setProperty('--animation-order', index);
            observer.observe(el);
        });

        return () => {
            animatedElements.forEach(el => observer.unobserve(el));
        };
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text">
                            <h1 className="hero-title">
                                SECURE PASSWORD MANAGEMENT
                                <span className="hero-subtitle">FOR MODERN ENTERPRISES</span>
                            </h1>
                            <p className="hero-description">
                                Enterprise-grade password security with zero-knowledge architecture and military-grade encryption.
                            </p>
                            <div className="hero-actions">
                                {isAuthenticated ? (
                                    <button onClick={navigateToDashboard} className="btn btn-primary btn-lg">
                                        <span>ACCESS DASHBOARD</span>
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={navigateToRegister} className="btn btn-primary btn-lg">
                                            <span>GET STARTED</span>
                                        </button>
                                        <button onClick={navigateToLogin} className="btn btn-secondary btn-lg">
                                            <span>SIGN IN</span>
                                        </button>
                                    </>
                                )}
                            </div>
                            <div className="hero-stats">
                                <div className="stat-item">
                                    <span className="stat-number">AES-256</span>
                                    <span className="stat-label">ENCRYPTION</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">ZERO-KNOWLEDGE</span>
                                    <span className="stat-label">ARCHITECTURE</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">CROSS-PLATFORM</span>
                                    <span className="stat-label">SYNC</span>
                                </div>
                            </div>
                        </div>
                        <div className="hero-visual">
                            <div className="security-grid">
                                <div className="grid-item">
                                    <i className="fas fa-shield-alt"></i>
                                </div>
                                <div className="grid-item">
                                    <i className="fas fa-lock"></i>
                                </div>
                                <div className="grid-item">
                                    <i className="fas fa-key"></i>
                                </div>
                                <div className="grid-item">
                                    <i className="fas fa-user-shield"></i>
                                </div>
                                <div className="grid-item">
                                    <i className="fas fa-fingerprint"></i>
                                </div>
                                <div className="grid-item">
                                    <i className="fas fa-eye-slash"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header scroll-animate">
                        <h2 className="section-title">ENTERPRISE SECURITY FEATURES</h2>
                        <p className="section-subtitle">
                            Advanced security technologies designed for enterprise environments
                        </p>
                    </div>
                    <div className="features-list">
                        <div className="feature-item scroll-animate">
                            <div className="feature-content">
                                <h3 className="feature-title">ZERO-KNOWLEDGE ARCHITECTURE</h3>
                                <p className="feature-description">
                                    Your data is encrypted on your device before transmission. We cannot access your passwords.
                                </p>
                            </div>
                            <div className="feature-icon">
                                <i className="fas fa-shield-alt"></i>
                            </div>
                        </div>
                        <div className="feature-item scroll-animate">
                            <div className="feature-icon">
                                <i className="fas fa-lock"></i>
                            </div>
                            <div className="feature-content">
                                <h3 className="feature-title">AES-256 ENCRYPTION</h3>
                                <p className="feature-description">
                                    Military-grade encryption ensures your passwords are protected with government-level security standards.
                                </p>
                            </div>
                        </div>
                        <div className="feature-item scroll-animate">
                            <div className="feature-content">
                                <h3 className="feature-title">CROSS-PLATFORM SYNC</h3>
                                <p className="feature-description">
                                    Access your passwords seamlessly across all devices with real-time synchronization.
                                </p>
                            </div>
                            <div className="feature-icon">
                                <i className="fas fa-sync-alt"></i>
                            </div>
                        </div>
                        <div className="feature-item scroll-animate">
                            <div className="feature-icon">
                                <i className="fas fa-users"></i>
                            </div>
                            <div className="feature-content">
                                <h3 className="feature-title">TEAM COLLABORATION</h3>
                                <p className="feature-description">
                                    Secure password sharing for teams with granular permissions and audit trails.
                                </p>
                            </div>
                        </div>
                        <div className="feature-item scroll-animate">
                            <div className="feature-content">
                                <h3 className="feature-title">SECURITY ANALYTICS</h3>
                                <p className="feature-description">
                                    Advanced threat detection and security insights with access pattern monitoring.
                                </p>
                            </div>
                            <div className="feature-icon">
                                <i className="fas fa-chart-line"></i>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section className="use-cases-section">
                <div className="container">
                    <div className="section-header scroll-animate">
                        <h2 className="section-title">ENTERPRISE USE CASES</h2>
                        <p className="section-subtitle">
                            Trusted by organizations across industries
                        </p>
                    </div>
                    <div className="use-cases-list">
                        <div className="use-case-item scroll-animate">
                            <div className="use-case-icon">
                                <i className="fas fa-building"></i>
                            </div>
                            <div className="use-case-content">
                                <h3 className="use-case-title">Financial Services</h3>
                                <p className="use-case-description">
                                    Secure password management for financial institutions with SOC 2, PCI DSS, and regulatory compliance requirements.
                                </p>
                            </div>
                        </div>
                        <div className="use-case-item scroll-animate">
                            <div className="use-case-icon">
                                <i className="fas fa-heartbeat"></i>
                            </div>
                            <div className="use-case-content">
                                <h3 className="use-case-title">Healthcare</h3>
                                <p className="use-case-description">
                                    HIPAA-compliant password security for healthcare providers protecting sensitive patient data and medical records.
                                </p>
                            </div>
                        </div>
                        <div className="use-case-item scroll-animate">
                            <div className="use-case-icon">
                                <i className="fas fa-graduation-cap"></i>
                            </div>
                            <div className="use-case-content">
                                <h3 className="use-case-title">Education</h3>
                                <p className="use-case-description">
                                    Secure access management for educational institutions with multi-user environments and student data protection.
                                </p>
                            </div>
                        </div>
                        <div className="use-case-item scroll-animate">
                            <div className="use-case-icon">
                                <i className="fas fa-cogs"></i>
                            </div>
                            <div className="use-case-content">
                                <h3 className="use-case-title">Manufacturing</h3>
                                <p className="use-case-description">
                                    Industrial security solutions for manufacturing facilities with operational technology and supply chain protection.
                                </p>
                            </div>
                        </div>
                        <div className="use-case-item scroll-animate">
                            <div className="use-case-icon">
                                <i className="fas fa-shield-alt"></i>
                            </div>
                            <div className="use-case-content">
                                <h3 className="use-case-title">Government</h3>
                                <p className="use-case-description">
                                    Federal-grade security solutions for government agencies with classified information and national security requirements.
                                </p>
                            </div>
                        </div>
                        <div className="use-case-item scroll-animate">
                            <div className="use-case-icon">
                                <i className="fas fa-rocket"></i>
                            </div>
                            <div className="use-case-content">
                                <h3 className="use-case-title">Technology</h3>
                                <p className="use-case-description">
                                    Advanced security for technology companies with intellectual property protection and development team collaboration.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">READY TO SECURE YOUR ORGANIZATION?</h2>
                        <p className="cta-description">
                            Join thousands of enterprises that trust Vaultify for their password security needs.
                        </p>
                        <div className="cta-actions">
                            {isAuthenticated ? (
                                <Link to="/dashboard" className="btn btn-primary btn-xl">
                                    <span>GO TO DASHBOARD</span>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register" className="btn btn-primary btn-xl">
                                        <span>GET STARTED</span>
                                    </Link>
                                    <Link to="/login" className="btn btn-secondary btn-xl">
                                        <span>SIGN IN</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home; 