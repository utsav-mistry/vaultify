import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../contexts/MessageContext';
import { useTheme } from '../contexts/ThemeContext';
import PixelIcon from '../components/PixelIcon';
import Sidebar from '../components/Sidebar';

import axios from 'axios';

// Configure axios base URL if not already set
if (!axios.defaults.baseURL) {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://vaultify-a88w.onrender.com';
    axios.defaults.baseURL = API_BASE_URL;
}

const Profile = () => {
    const { user, updateProfile, deleteAccount, getDeviceUidHeader } = useAuth();
    const { showMessage } = useMessage();
    const { theme } = useTheme();

    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarAreaHovered, setSidebarAreaHovered] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [stats, setStats] = useState({
        totalPasswords: 0,
        uniqueWebsites: 0,
        recentPasswords: 0
    });


    useEffect(() => {
        if (sidebarAreaHovered) setSidebarOpen(true);
        else setSidebarOpen(false);
    }, [sidebarAreaHovered]);

    const handleSidebarEnter = () => setSidebarAreaHovered(true);
    const handleSidebarLeave = () => setSidebarAreaHovered(false);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || ''
            });
            setFetchError(null);
            fetchStats();
        } else if (!loading) {
            setFetchError('Failed to load profile. Please try again later.');
        }
    }, [user, loading]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordInputChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();

        if (!formData.username.trim()) {
            showMessage('Username is required', 'error');
            return;
        }

        setLoading(true);
        try {
            await updateProfile({
                username: formData.username,
                email: formData.email
            });
            showMessage('Profile updated successfully', 'success');
        } catch (error) {
            showMessage(error.message || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (!passwordData.currentPassword) {
            showMessage('Current password is required', 'error');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            showMessage('New password must be at least 8 characters long', 'error');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showMessage('New passwords do not match', 'error');
            return;
        }

        setLoading(true);
        try {
            await updateProfile({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            showMessage('Password changed successfully', 'success');

            // Clear password fields and close modal
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setShowPasswordModal(false);
        } catch (error) {
            showMessage(error.message || 'Failed to change password', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteLoading(true);
        try {
            await deleteAccount();
            showMessage('Account deleted successfully', 'success');
        } catch (error) {
            showMessage(error.message || 'Failed to delete account', 'error');
        } finally {
            setDeleteLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    const openPasswordModal = () => {
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setShowPasswordModal(true);
    };

    const closePasswordModal = () => {
        setShowPasswordModal(false);
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    const fetchStats = async () => {
        try {
            const headers = getDeviceUidHeader();
            console.log('[Device] Sending x-device-uid header:', headers['x-device-uid']);
            const response = await axios.get('/api/passwords/stats/overview', { headers });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="sidebar-area"
                    onMouseEnter={handleSidebarEnter}
                    onMouseLeave={handleSidebarLeave}
                    style={{ position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 10000 }}
                >
                    <div className="sidebar-hover-zone" />
                    <div className="left-edge-indicator">{'>'}</div>
                    <Sidebar isOpen={sidebarOpen} onClose={handleSidebarLeave} />
                </div>
                {sidebarOpen && (
                    <>
                        <div className="sidebar-overlay" onClick={handleSidebarLeave} />
                        <div className="blur-overlay" />
                    </>
                )}
                <main className={sidebarOpen ? 'blurred' : ''}>
                    <div className="loading">
                        <div className="pixelated-spinner">
                            <div className="pixel"></div>
                            <div className="pixel"></div>
                            <div className="pixel"></div>
                            <div className="pixel"></div>
                            <div className="pixel"></div>
                            <div className="pixel"></div>
                            <div className="pixel"></div>
                        </div>
                        <div className="loading-text">Loading your stats...</div>
                    </div>
                </main>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="profile-page">
                <div className="sidebar-area"
                    onMouseEnter={handleSidebarEnter}
                    onMouseLeave={handleSidebarLeave}
                    style={{ position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 10000 }}
                >
                    <div className="sidebar-hover-zone" />
                    <div className="left-edge-indicator">{'>'}</div>
                    <Sidebar isOpen={sidebarOpen} onClose={handleSidebarLeave} />
                </div>
                {sidebarOpen && (
                    <>
                        <div className="sidebar-overlay" onClick={handleSidebarLeave} />
                        <div className="blur-overlay" />
                    </>
                )}
                <main className={sidebarOpen ? 'blurred' : ''}>
                    <div className="profile-header">
                        <h1>Profile Settings</h1>
                        <p>Manage your account information and security settings</p>
                    </div>
                    <div className="empty-state">
                        <PixelIcon name="alert" />
                        <h3>Error Loading Profile</h3>
                        <p>{fetchError}</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div
                className="sidebar-area"
                onMouseEnter={handleSidebarEnter}
                onMouseLeave={handleSidebarLeave}
                style={{ position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 10000 }}
            >
                <div className="sidebar-hover-zone" />
                <div className="left-edge-indicator">{'>'}</div>
                <Sidebar isOpen={sidebarOpen} onClose={handleSidebarLeave} />
            </div>
            {sidebarOpen && (
                <>
                    <div className="sidebar-overlay" onClick={handleSidebarLeave} />
                    <div className="blur-overlay" />
                </>
            )}
            <main className={sidebarOpen ? 'blurred' : ''}>
                <div className="profile-header">
                    <h1>Profile Settings</h1>
                    <p>Manage your account information and security settings</p>
                </div>

                <div className="profile-sections">
                    <div className="profile-section">
                        <h2>Account Information</h2>
                        <form onSubmit={handleProfileUpdate}>
                            <div className="profile-field">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="profile-field-value"
                                    required
                                />
                            </div>
                            <div className="profile-field">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="profile-field-value"
                                    required
                                />
                            </div>
                            <div className="profile-actions">
                                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                    {loading ? (
                                        <div className="pixelated-spinner">
                                            <div className="pixel"></div>
                                            <div className="pixel"></div>
                                            <div className="pixel"></div>
                                            <div className="pixel"></div>
                                            <div className="pixel"></div>
                                            <div className="pixel"></div>
                                            <div className="pixel"></div>
                                        </div>
                                    ) : (
                                        <span>UPDATE PROFILE</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="profile-section">
                        <h2>Security Settings</h2>
                        <p>Change your password to keep your account secure.</p>
                        <div className="profile-actions">
                            <button
                                type="button"
                                className="btn btn-secondary btn-lg"
                                onClick={openPasswordModal}
                            >
                                <span>CHANGE PASSWORD</span>
                            </button>
                        </div>
                    </div>

                    <div className="profile-section">
                        <h2>Account Statistics</h2>
                        <div className="profile-field">
                            <label>Total Passwords</label>
                            <div className="profile-field-value">
                                {stats.totalPasswords || 0}
                            </div>
                        </div>
                        <div className="profile-field">
                            <label>Unique Websites</label>
                            <div className="profile-field-value">
                                {stats.uniqueWebsites || 0}
                            </div>
                        </div>
                        <div className="profile-field">
                            <label>Recent Additions</label>
                            <div className="profile-field-value">
                                {stats.recentPasswords || 0}
                            </div>
                        </div>
                    </div>

                    <div className="profile-section">
                        <h2>Danger Zone</h2>
                        <p>Once you delete your account, there is no going back. Please be certain.</p>
                        <div className="profile-actions">
                            <button
                                type="button"
                                className="btn btn-secondary btn-lg"
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? (
                                    <div className="pixelated-spinner">
                                        <div className="pixel"></div>
                                        <div className="pixel"></div>
                                        <div className="pixel"></div>
                                        <div className="pixel"></div>
                                        <div className="pixel"></div>
                                        <div className="pixel"></div>
                                        <div className="pixel"></div>
                                    </div>
                                ) : (
                                    <span>DELETE ACCOUNT</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Change Password Modal */}
                {showPasswordModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <div className="modal-header">
                                <h3>Change Password</h3>
                                <button
                                    type="button"
                                    className="modal-close"
                                    onClick={closePasswordModal}
                                >
                                    <PixelIcon type="times" />
                                </button>
                            </div>
                            <form onSubmit={handlePasswordChange}>
                                <div className="modal-content">
                                    <div className="profile-field">
                                        <label htmlFor="currentPassword">Current Password</label>
                                        <input
                                            type="password"
                                            id="currentPassword"
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordInputChange}
                                            className="profile-field-value"
                                            required
                                        />
                                    </div>
                                    <div className="profile-field">
                                        <label htmlFor="newPassword">New Password</label>
                                        <input
                                            type="password"
                                            id="newPassword"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordInputChange}
                                            className="profile-field-value"
                                            required
                                        />
                                    </div>
                                    <div className="profile-field">
                                        <label htmlFor="confirmPassword">Confirm New Password</label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordInputChange}
                                            className="profile-field-value"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-lg"
                                        onClick={closePasswordModal}
                                        disabled={loading}
                                    >
                                        <span>CANCEL</span>
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <div className="pixelated-spinner">
                                                <div className="pixel"></div>
                                                <div className="pixel"></div>
                                                <div className="pixel"></div>
                                                <div className="pixel"></div>
                                                <div className="pixel"></div>
                                                <div className="pixel"></div>
                                                <div className="pixel"></div>
                                            </div>
                                        ) : (
                                            <span>CHANGE PASSWORD</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <div className="modal-header">
                                <h3>Delete Account</h3>
                            </div>
                            <div className="modal-content">
                                <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                                <p>All your passwords, devices, and data will be permanently deleted.</p>
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="btn btn-secondary btn-lg"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={deleteLoading}
                                >
                                    <span>CANCEL</span>
                                </button>
                                <button
                                    className="btn btn-secondary btn-lg"
                                    onClick={handleDeleteAccount}
                                    disabled={deleteLoading}
                                >
                                    {deleteLoading ? (
                                        <span>DELETING...</span>
                                    ) : (
                                        <span>DELETE ACCOUNT</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Profile; 