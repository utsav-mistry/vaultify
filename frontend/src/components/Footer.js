import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="links">
                    <Link to="/version">Version</Link>
                    <Link to="/privacy-policy">Privacy</Link>
                    <Link to="/terms-of-service">Terms</Link>
                    <span>© 2025 Vaultify</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 