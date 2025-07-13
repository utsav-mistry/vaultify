import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ id, isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        onClose();
    };

    // Highlight active link for parent and subroutes
    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    // User info click handler
    const handleUserInfoClick = () => {
        navigate('/profile');
        onClose();
    };

    return (
        <aside id={id} className={`sidebar ${isOpen ? 'open' : ''}`} onMouseLeave={onClose}>
            <div className="sidebar-header">
                <h2 className="sidebar-title">VAULTIFY</h2>
                {user && (
                    <div
                        className="user-info"
                        style={{ cursor: 'pointer' }}
                        onClick={handleUserInfoClick}
                        tabIndex={0}
                        role="button"
                        aria-label="View account info"
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleUserInfoClick()}
                    >
                        <div className="user-name">{user.username || 'User'}</div>
                        <div className="user-email">{user.email}</div>
                    </div>
                )}
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    <li className="nav-item">
                        <Link
                            to="/dashboard"
                            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            DASHBOARD
                        </Link>
                    </li>

                    <li className="nav-item">
                        <Link
                            to="/devices"
                            className={`nav-link ${isActive('/devices') ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            DEVICES
                        </Link>
                    </li>

                    <li className="nav-item">
                        <Link
                            to="/device-approval"
                            className={`nav-link ${isActive('/device-approval') ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            DEVICE APPROVAL
                        </Link>
                    </li>

                    <li className="nav-item">
                        <Link
                            to="/import-export"
                            className={`nav-link ${isActive('/import-export') ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            IMPORT/EXPORT
                        </Link>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button className="btn btn-primary" onClick={handleLogout}>
                    <span>LOGOUT</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar; 