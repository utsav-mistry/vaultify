import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import HomeHeader from './components/HomeHeader';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Devices from './pages/Devices';
import DeviceApproval from './pages/DeviceApproval';
import ImportExport from './pages/ImportExport';
import AddPassword from './pages/AddPassword';
import EditPassword from './pages/EditPassword';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Version from './pages/Version';
import Reactivate from './pages/Reactivate';


// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

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
                <div className="loading-text">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Global Theme Toggle Component
const GlobalThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="global-theme-toggle">
            <button
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
                {theme === 'dark' ? (
                    <i className="fas fa-sun"></i>
                ) : (
                    <i className="fas fa-moon"></i>
                )}
            </button>
        </div>
    );
};

function App() {
    const { user, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const sidebar = document.getElementById('sidebar');
            const toggleButton = document.getElementById('toggleSidebar');

            if (sidebarOpen && sidebar && !sidebar.contains(event.target) && !toggleButton?.contains(event.target)) {
                setSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [sidebarOpen]);

    // Preserve scroll position when sidebar opens/closes
    useEffect(() => {
        if (sidebarOpen) {
            // Save current scroll position when opening sidebar
            setScrollPosition(window.scrollY);
        } else {
            // Restore scroll position when closing sidebar
            setTimeout(() => {
                window.scrollTo(0, scrollPosition);
            }, 100);
        }
    }, [sidebarOpen, scrollPosition]);

    // Determine if current route is public (home page) or auth page
    const isPublicRoute = ['/', '/version', '/privacy-policy', '/terms-of-service'].includes(location.pathname);
    const isAuthRoute = ['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'].includes(location.pathname);

    return (
        <div className="app">
            {/* Global Theme Toggle - Always visible */}
            <GlobalThemeToggle />

            {/* Sidebar - Only visible when authenticated */}
            {user && (
                <Sidebar
                    id="sidebar"
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
            )}

            <div className={`content-wrapper ${user && sidebarOpen ? 'sidebar-expanded' : ''}`}>
                {/* Header - Show HomeHeader only on public routes, nothing on protected routes */}
                {isPublicRoute ? (
                    <HomeHeader />
                ) : null}

                <main className={user ? 'authenticated-main' : 'public-main'}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/verify-otp" element={<VerifyOTP />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/terms-of-service" element={<TermsOfService />} />
                        <Route path="/version" element={<Version />} />
                        <Route path="/reactivate" element={<Reactivate />} />

                        {/* Protected Routes */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        } />
                        <Route path="/devices" element={
                            <ProtectedRoute>
                                <Devices />
                            </ProtectedRoute>
                        } />
                        <Route path="/device-approval" element={
                            <ProtectedRoute>
                                <DeviceApproval />
                            </ProtectedRoute>
                        } />
                        <Route path="/import-export" element={
                            <ProtectedRoute>
                                <ImportExport />
                            </ProtectedRoute>
                        } />
                        <Route path="/add-password" element={
                            <ProtectedRoute>
                                <AddPassword />
                            </ProtectedRoute>
                        } />
                        <Route path="/edit-password/:id" element={
                            <ProtectedRoute>
                                <EditPassword />
                            </ProtectedRoute>
                        } />

                        {/* Catch all route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>

                {/* Footer - Show on all pages */}
                <Footer />
            </div>
        </div>
    );
}

export default App; 