import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../contexts/MessageContext';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

// Configure axios base URL if not already set
if (!axios.defaults.baseURL) {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://vaultify-a88w.onrender.com';
    axios.defaults.baseURL = API_BASE_URL;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const [passwords, setPasswords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [stats, setStats] = useState({
        totalPasswords: 0,
        uniqueWebsites: 0,
        recentPasswords: 0
    });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarAreaHovered, setSidebarAreaHovered] = useState(false);

    // Sidebar hover logic
    useEffect(() => {
        if (sidebarAreaHovered) setSidebarOpen(true);
        else setSidebarOpen(false);
    }, [sidebarAreaHovered]);

    // Handlers
    const handleSidebarEnter = () => setSidebarAreaHovered(true);
    const handleSidebarLeave = () => setSidebarAreaHovered(false);

    const { showSuccess, showError } = useMessage();
    const suggestionsRef = useRef(null);
    const inputRef = useRef(null);
    const [isComposing, setIsComposing] = useState(false);
    const debounceTimeout = useRef(null);

    useEffect(() => {
        fetchPasswords();
        fetchStats();
    }, []);

    // Debounced search logic
    useEffect(() => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        if (!searchQuery.trim()) {
            setSearchSuggestions([]);
            setShowSuggestions(false);
            setSelectedSuggestionIndex(-1);
            return;
        }

        debounceTimeout.current = setTimeout(() => {
            // Generate suggestions from passwords
            const query = searchQuery.toLowerCase();
            const suggestions = [];

            // Get all passwords for suggestions (not filtered ones)
            const allPasswords = passwords.length > 0 ? passwords : [];

            allPasswords.forEach(password => {
                if (password.website.toLowerCase().includes(query) && !suggestions.includes(password.website)) {
                    suggestions.push(password.website);
                }
            });
            allPasswords.forEach(password => {
                if (password.username.toLowerCase().includes(query) && !suggestions.includes(password.username)) {
                    suggestions.push(password.username);
                }
            });

            setSearchSuggestions(suggestions.slice(0, 5));
            setShowSuggestions(suggestions.length > 0);
            setSelectedSuggestionIndex(-1);
        }, 200);

        return () => clearTimeout(debounceTimeout.current);
    }, [searchQuery, passwords]);

    // Keyboard navigation
    const handleSearchKeyDown = (e) => {
        if (isComposing) return;
        if (!showSuggestions || searchSuggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const newIndex = selectedSuggestionIndex < searchSuggestions.length - 1 ? selectedSuggestionIndex + 1 : 0;
            setSelectedSuggestionIndex(newIndex);
            // Auto-scroll to selected item
            setTimeout(() => {
                const selectedElement = suggestionsRef.current?.querySelector(`[data-index="${newIndex}"]`);
                if (selectedElement) {
                    selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            }, 0);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const newIndex = selectedSuggestionIndex > 0 ? selectedSuggestionIndex - 1 : searchSuggestions.length - 1;
            setSelectedSuggestionIndex(newIndex);
            // Auto-scroll to selected item
            setTimeout(() => {
                const selectedElement = suggestionsRef.current?.querySelector(`[data-index="${newIndex}"]`);
                if (selectedElement) {
                    selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            }, 0);
        } else if (e.key === 'Enter') {
            if (selectedSuggestionIndex >= 0) {
                e.preventDefault();
                selectSuggestion(searchSuggestions[selectedSuggestionIndex]);
            } else {
                handleSearch();
            }
            // Close suggestions after Enter
            setShowSuggestions(false);
            setSelectedSuggestionIndex(-1);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            setSelectedSuggestionIndex(-1);
        }
    };

    // IME composition (for Asian languages)
    const handleCompositionStart = () => setIsComposing(true);
    const handleCompositionEnd = () => setIsComposing(false);

    // Suggestion selection logic
    const selectSuggestion = (suggestion) => {
        setSearchQuery(suggestion);
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        // Don't filter passwords immediately - let the useEffect handle it
        if (inputRef.current) inputRef.current.focus();
    };

    // Mouse click on suggestion
    const handleSuggestionClick = (suggestion) => {
        selectSuggestion(suggestion);
    };

    // Mouse enter on suggestion
    const handleSuggestionMouseEnter = (index) => {
        // Only update if not already selected
        if (selectedSuggestionIndex !== index) {
            setSelectedSuggestionIndex(index);
        }
    };

    // Blur logic: delay hiding to allow click
    const handleSearchBlur = (e) => {
        // Check if the related target is within the suggestions
        const suggestionsElement = suggestionsRef.current;
        if (suggestionsElement && suggestionsElement.contains(e.relatedTarget)) {
            return;
        }
        // Also check if clicking on the input itself
        if (inputRef.current && inputRef.current.contains(e.relatedTarget)) {
            return;
        }
        setTimeout(() => setShowSuggestions(false), 150);
    };

    // Focus logic: show suggestions if query
    const handleSearchFocus = () => {
        if (searchQuery.trim() && searchSuggestions.length > 0) {
            setShowSuggestions(true);
            setSelectedSuggestionIndex(-1);
        }
    };

    // Input change handler to ensure suggestions show when typing
    const handleSearchInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        // If user is typing and there are suggestions, show them
        if (value.trim() && searchSuggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    // Clear search
    const handleClearSearch = () => {
        setSearchQuery('');
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        if (inputRef.current) inputRef.current.focus();
        fetchPasswords();
    };

    const fetchPasswords = async () => {
        try {
            const response = await axios.get('/api/passwords');
            setPasswords(response.data.passwords);
        } catch (error) {
            console.error('Error fetching passwords:', error);
            showError('Failed to load passwords');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/passwords/stats/overview');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchPasswords();
            return;
        }

        try {
            const response = await axios.get(`/api/passwords/search/${encodeURIComponent(searchQuery)}`);
            setPasswords(response.data.passwords);
            setShowSuggestions(false);
        } catch (error) {
            console.error('Error searching passwords:', error);
            showError('Search failed');
        }
    };

    const handleDelete = (passwordId) => {
        confirmAlert({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this password?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
                        try {
                            await axios.delete(`/api/passwords/${passwordId}`);
                            setPasswords(passwords.filter(pwd => pwd._id !== passwordId));
                            showSuccess('Password deleted successfully');
                            fetchStats();
                        } catch (error) {
                            console.error('Error deleting password:', error);
                            showError('Failed to delete password');
                        }
                    }
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ]
        });
    };

    const handleCopy = (text, type) => {
        showSuccess(`${type} copied to clipboard!`);
    };

    const handleAddPassword = () => {
        navigate('/add-password');
    };

    const handleEditPassword = (password) => {
        navigate(`/edit-password/${password.id || password._id}`);
    };

    const togglePasswordVisibility = (passwordId) => {
        setVisiblePasswords(prev => {
            const newState = { ...prev };
            if (newState[passwordId]) {
                delete newState[passwordId];
            } else {
                newState[passwordId] = true;
            }
            return newState;
        });
    };

    // Filter passwords based on search query (for dynamic search)
    const filteredPasswords = passwords.filter(password =>
        password.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
        password.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
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
                <div className="loading-text">Loading your passwords...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-page content-wrapper">
            <div
                className="sidebar-area"
                onMouseEnter={handleSidebarEnter}
                onMouseLeave={handleSidebarLeave}
                style={{ position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 10000 }}
            >
                <div
                    className="sidebar-hover-zone"
                />
                <div
                    className="left-edge-indicator"
                >
                    {'>'}
                </div>
                {/* Sidebar */}
                <Sidebar isOpen={sidebarOpen} onClose={handleSidebarLeave} />
            </div>
            {/* Sidebar and Overlay */}
            {sidebarOpen && (
                <>
                    <div className="sidebar-overlay" onClick={handleSidebarLeave} />
                    <div className="blur-overlay" />
                </>
            )}
            {/* Main Content (blurred when sidebar open) */}
            <main className={sidebarOpen ? 'blurred' : ''}>
                <div className="container">
                    <div className="dashboard-header">
                        <h1>Password Dashboard</h1>
                        <p>Manage and secure all your passwords in one place</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-content">
                                <h3>{stats.totalPasswords}</h3>
                                <p>Total Passwords</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-content">
                                <h3>{stats.uniqueWebsites}</h3>
                                <p>Unique Websites</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-content">
                                <h3>{stats.recentPasswords}</h3>
                                <p>Recent Additions</p>
                            </div>
                        </div>
                    </div>

                    {/* Search and Add */}
                    <div className="dashboard-actions">
                        <div className="search-container">
                            <div className="search-input-wrapper">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Search passwords..."
                                    value={searchQuery}
                                    onChange={handleSearchInputChange}
                                    onKeyDown={handleSearchKeyDown}
                                    onFocus={handleSearchFocus}
                                    onBlur={handleSearchBlur}
                                    onCompositionStart={handleCompositionStart}
                                    onCompositionEnd={handleCompositionEnd}
                                    className="search-input"
                                    autoComplete="off"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="clear-search"
                                        title="Clear search"
                                        tabIndex={-1}
                                    >
                                        <span>×</span>
                                    </button>
                                )}
                                {showSuggestions && searchSuggestions.length > 0 && (
                                    <div className="search-suggestions" ref={suggestionsRef}>
                                        {searchSuggestions.map((suggestion, idx) => (
                                            <div
                                                key={idx}
                                                data-index={idx}
                                                className={`suggestion-item${idx === selectedSuggestionIndex ? ' suggestion-item-selected' : ''}`}
                                                onMouseDown={() => handleSuggestionClick(suggestion)}
                                                onMouseEnter={() => handleSuggestionMouseEnter(idx)}
                                            >
                                                <span>{suggestion}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button onClick={handleSearch} className="btn btn-primary">
                                <span>Search</span>
                            </button>
                            <div className="search-results-count">
                                {searchQuery && `${filteredPasswords.length} found`}
                            </div>
                        </div>
                        <button onClick={handleAddPassword} className="btn btn-primary">
                            <span>Add Password</span>
                        </button>
                    </div>

                    {/* Passwords Grid */}
                    <div className="passwords-section">
                        <h2>Your Passwords</h2>
                        {filteredPasswords.length === 0 ? (
                            <div className="empty-state">
                                <i className="fas fa-key"></i>
                                <h3>No passwords found</h3>
                                <p>{searchQuery ? `No passwords match "${searchQuery}"` : 'Start by adding your first password to keep it secure'}</p>
                                {searchQuery ? (
                                    <button onClick={handleClearSearch} className="btn btn-primary">
                                        <span>Clear Search</span>
                                    </button>
                                ) : (
                                    <button onClick={handleAddPassword} className="btn btn-primary">
                                        <span>Add Your First Password</span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="password-grid">
                                {filteredPasswords.map((password) => (
                                    <div key={password.id || password._id} className="password-card">
                                        <div className="password-header">
                                            <h3 className="password-website">{password.website}</h3>
                                            <div className="password-actions">
                                                <button
                                                    onClick={() => handleEditPassword(password)}
                                                    className="btn btn-secondary btn-sm"
                                                    title="Edit"
                                                >
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(password.id || password._id)}
                                                    className="btn btn-error btn-sm"
                                                    title="Delete"
                                                >
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="password-details">
                                            <div className="password-field">
                                                <label>Username</label>
                                                <div className="field-value">
                                                    <span>{password.username}</span>
                                                    <CopyToClipboard
                                                        text={password.username}
                                                        onCopy={() => handleCopy(password.username, 'Username')}
                                                    >
                                                        <button className="btn btn-sm" title="Copy username">
                                                            <i className="fas fa-copy"></i>
                                                        </button>
                                                    </CopyToClipboard>
                                                </div>
                                            </div>
                                            <div className="password-field">
                                                <label>Password</label>
                                                <div className="field-value">
                                                    <span className={visiblePasswords[password.id || password._id] ? "password-visible" : "password-mask"}>
                                                        {visiblePasswords[password.id || password._id] ? password.password : "••••••••••••••••"}
                                                    </span>
                                                    <button
                                                        className="btn btn-sm"
                                                        title={visiblePasswords[password.id || password._id] ? "Hide password" : "Show password"}
                                                        onClick={() => togglePasswordVisibility(password.id || password._id)}
                                                    >
                                                        <i className={`fas ${visiblePasswords[password.id || password._id] ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                    </button>
                                                    <CopyToClipboard
                                                        text={password.password}
                                                        onCopy={() => handleCopy(password.password, 'Password')}
                                                    >
                                                        <button className="btn btn-sm" title="Copy password">
                                                            <i className="fas fa-copy"></i>
                                                        </button>
                                                    </CopyToClipboard>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

        </div>
    );
};

export default Dashboard; 