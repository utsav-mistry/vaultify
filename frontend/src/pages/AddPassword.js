import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../contexts/MessageContext';
import { useTheme } from '../contexts/ThemeContext';
import PixelIcon from '../components/PixelIcon';
import Sidebar from '../components/Sidebar';


const AddPassword = () => {
    const { user } = useAuth();
    const { showMessage } = useMessage();
    const { theme } = useTheme();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarAreaHovered, setSidebarAreaHovered] = useState(false);
    const [formData, setFormData] = useState({
        website: '',
        username: '',
        password: ''
    });


    useEffect(() => {
        if (sidebarAreaHovered) setSidebarOpen(true);
        else setSidebarOpen(false);
    }, [sidebarAreaHovered]);

    const handleSidebarEnter = () => setSidebarAreaHovered(true);
    const handleSidebarLeave = () => setSidebarAreaHovered(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const generatePassword = () => {
        const length = 16;
        const lowercase = "abcdefghijklmnopqrstuvwxyz";
        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

        // Ensure at least one character from each category
        let password = "";
        password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
        password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));
        password += symbols.charAt(Math.floor(Math.random() * symbols.length));

        // Fill the rest with random characters from all categories
        const allChars = lowercase + uppercase + numbers + symbols;
        for (let i = 4; i < length; i++) {
            password += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }

        // Shuffle the password to avoid predictable patterns
        password = password.split('').sort(() => Math.random() - 0.5).join('');

        setFormData(prev => ({
            ...prev,
            password
        }));
    };

    const copyPassword = async () => {
        if (!formData.password) {
            showMessage('No password to copy', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(formData.password);
            showMessage('Password copied to clipboard!', 'success');
        } catch (error) {
            showMessage('Failed to copy password to clipboard', 'error');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const clearForm = () => {
        setFormData({
            website: '',
            username: '',
            password: '',
        });
        setShowPassword(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent submission if already loading
        if (loading) {
            return;
        }

        // Validate required fields
        if (!formData.website.trim()) {
            showMessage('Website/Service is required', 'error');
            return;
        }

        if (!formData.username.trim()) {
            showMessage('Username/Email is required', 'error');
            return;
        }

        if (!formData.password.trim()) {
            showMessage('Password is required', 'error');
            return;
        }

        // Validate password strength (optional but recommended)
        if (formData.password.length < 8) {
            showMessage('Password should be at least 8 characters long', 'error');
            return;
        }

        setLoading(true);

        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://vaultify-a88w.onrender.com';
            const deviceUid = localStorage.getItem('device_uid');
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            };
            if (deviceUid) headers['x-device-uid'] = deviceUid;
            const response = await fetch(`${API_BASE_URL}/api/passwords`, {
                method: 'POST',
                headers,
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showMessage('Password added successfully!', 'success');
                navigate('/dashboard');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add password');
            }
        } catch (error) {
            showMessage(error.message || 'Failed to add password', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-password-page">
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
                <div className="modal-overlay">
                    <div className="modal password-modal">
                        <div className="modal-header">
                            <h2>Add New Password</h2>
                            <button
                                type="button"
                                className="modal-close pixel-icon-btn"
                                onClick={() => navigate('/dashboard')}
                            >
                                <PixelIcon type="times" />
                            </button>
                        </div>
                        <div className="modal-content">
                            <p className="modal-description">Create a new password entry for your vault</p>

                            <form onSubmit={handleSubmit} className="password-form">
                                <div className="form-group">
                                    <label htmlFor="website">Website/Service</label>
                                    <input
                                        type="text"
                                        id="website"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="e.g., google.com, github.com"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="username">Username/Email</label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Enter your username or email"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <div className="password-input-group">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Enter your password"
                                            required
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="btn btn-secondary pixel-icon-btn"
                                            title={showPassword ? "Hide password" : "Show password"}
                                        >
                                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={generatePassword}
                                            className="btn btn-secondary pixel-icon-btn"
                                            title="Generate secure password"
                                        >
                                            <i className="fas fa-magic"></i>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={copyPassword}
                                            className="btn btn-secondary pixel-icon-btn"
                                            title="Copy password"
                                            disabled={!formData.password}
                                        >
                                            <i className="fas fa-copy"></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        onClick={clearForm}
                                        className="btn btn-secondary btn-lg"
                                        disabled={loading}
                                    >
                                        <span>CLEAR FORM</span>
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
                                            <span>ADD PASSWORD</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AddPassword; 