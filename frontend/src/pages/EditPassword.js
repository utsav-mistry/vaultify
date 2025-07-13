import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../contexts/MessageContext';
import { useTheme } from '../contexts/ThemeContext';
import PixelIcon from '../components/PixelIcon';
import Sidebar from '../components/Sidebar';


const EditPassword = () => {
    const { user } = useAuth();
    const { showMessage } = useMessage();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarAreaHovered, setSidebarAreaHovered] = useState(false);
    const [password, setPassword] = useState({
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

    useEffect(() => {
        fetchPassword();
    }, [id]);

    const fetchPassword = async () => {
        try {
            const response = await fetch(`/api/passwords/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPassword({
                    website: data.website || '',
                    username: data.username || '',
                    password: data.password || ''
                });
            } else {
                showMessage('Failed to load password', 'error');
                navigate('/dashboard');
            }
        } catch (error) {
            showMessage('Failed to load password', 'error');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setPassword({
            ...password,
            [e.target.name]: e.target.value
        });
    };

    const generatePassword = () => {
        const length = 16;
        const lowercase = "abcdefghijklmnopqrstuvwxyz";
        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

        // Ensure at least one character from each category
        let generatedPassword = "";
        generatedPassword += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
        generatedPassword += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
        generatedPassword += numbers.charAt(Math.floor(Math.random() * numbers.length));
        generatedPassword += symbols.charAt(Math.floor(Math.random() * symbols.length));

        // Fill the rest with random characters from all categories
        const allChars = lowercase + uppercase + numbers + symbols;
        for (let i = 4; i < length; i++) {
            generatedPassword += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }

        // Shuffle the password to avoid predictable patterns
        generatedPassword = generatedPassword.split('').sort(() => Math.random() - 0.5).join('');

        setPassword({
            ...password,
            password: generatedPassword
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const copyPassword = async () => {
        if (!password.password) {
            showMessage('No password to copy', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(password.password);
            showMessage('Password copied to clipboard!', 'success');
        } catch (error) {
            showMessage('Failed to copy password to clipboard', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!password.website.trim() || !password.username.trim() || !password.password.trim()) {
            showMessage('Website, username, and password are required', 'error');
            return;
        }

        setSaving(true);
        try {
            const response = await fetch(`/api/passwords/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(password)
            });

            if (response.ok) {
                showMessage('Password updated successfully', 'success');
                navigate('/dashboard');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update password');
            }
        } catch (error) {
            showMessage(error.message || 'Failed to update password', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this password? This action cannot be undone.')) {
            return;
        }

        setSaving(true);
        try {
            const response = await fetch(`/api/passwords/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                showMessage('Password deleted successfully', 'success');
                navigate('/dashboard');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete password');
            }
        } catch (error) {
            showMessage(error.message || 'Failed to delete password', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="edit-password-page">
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
                            <div className="loading">
                                <div className="pixelated-spinner">
                                    <div className="pixel"></div>
                                    <div className="pixel"></div>
                                    <div className="pixel"></div>
                                    <div className="pixel"></div>
                                    <div className="pixel"></div>
                                    <div className="pixel"></div>
                                    <div className="pixel"></div>
                                    <div className="pixel"></div>
                                </div>
                                <div className="loading-text">Loading password...</div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="edit-password-page">
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
                            <h2>Edit Password</h2>
                            <button
                                type="button"
                                className="modal-close pixel-icon-btn"
                                onClick={() => navigate('/dashboard')}
                            >
                                <PixelIcon type="times" />
                            </button>
                        </div>
                        <div className="modal-content">
                            <p className="modal-description">Update your password information</p>

                            <form onSubmit={handleSubmit} className="password-form">
                                <div className="form-group">
                                    <label htmlFor="website">Website/Service</label>
                                    <input
                                        type="text"
                                        id="website"
                                        name="website"
                                        value={password.website}
                                        onChange={handleInputChange}
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
                                        value={password.username}
                                        onChange={handleInputChange}
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
                                            value={password.password}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="Enter your password"
                                            required
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
                                            disabled={!password.password}
                                        >
                                            <i className="fas fa-copy"></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/dashboard')}
                                        className="btn btn-secondary btn-lg"
                                        disabled={saving}
                                    >
                                        <span>CANCEL</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="btn btn-secondary btn-lg"
                                        disabled={saving}
                                    >
                                        {saving ? (
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
                                            <span>DELETE PASSWORD</span>
                                        )}
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg"
                                        disabled={saving}
                                    >
                                        {saving ? (
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
                                            <span>UPDATE PASSWORD</span>
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

export default EditPassword; 