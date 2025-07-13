import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useMessage } from './MessageContext';

// Configure axios base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://vaultify-a88w.onrender.com';
axios.defaults.baseURL = API_BASE_URL;

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showMessage } = useMessage();

    // Configure axios defaults
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    // Check if user is authenticated on app load
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            console.log('AuthContext: Initial auth check, token exists:', !!token);

            if (token) {
                try {
                    console.log('AuthContext: Making /api/auth/me request');
                    const response = await axios.get('/api/auth/me');
                    console.log('AuthContext: /api/auth/me response:', response.data);
                    setUser(response.data.user);
                } catch (error) {
                    console.error('AuthContext: Auth check failed:', error);
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                }
            }
            setLoading(false);
            console.log('AuthContext: Initial auth check complete');
        };

        checkAuth();
    }, []);

    // Register user
    const register = async (userData) => {
        try {
            const response = await axios.post('/api/auth/register', userData);
            showMessage(response.data.message, 'success');
            return { success: true, email: response.data.email };
        } catch (error) {
            const message = error.response?.data?.error || 'Registration failed';
            showMessage(message, 'error');
            return { success: false, error: message };
        }
    };

    // Verify OTP
    const verifyOTP = async (email, otp) => {
        try {
            const response = await axios.post('/api/auth/verify-otp', { email, otp });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);

            showMessage('Registration successful!', 'success');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.error || 'OTP verification failed';
            showMessage(message, 'error');
            return { success: false, error: message };
        }
    };

    // Login user
    const login = async (credentials) => {
        try {
            console.log('AuthContext: Login attempt with credentials:', credentials);
            const response = await axios.post('/api/auth/login', credentials);
            console.log('AuthContext: Login response:', response.data);

            const { token, user } = response.data;

            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            console.log('AuthContext: User state set to:', user);

            showMessage('Login successful!', 'success');
            return { success: true };
        } catch (error) {
            console.error('AuthContext: Login error:', error.response?.data || error);

            const message = error.response?.data?.error || 'Login failed';
            showMessage(message, 'error');
            return { success: false, error: message };
        }
    };



    // Logout user
    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            showMessage('Logged out successfully', 'success');
        }
    };

    // Forgot password
    const forgotPassword = async (email) => {
        try {
            const response = await axios.post('/api/auth/forgot-password', { email });
            showMessage(response.data.message, 'success');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.error || 'Password reset failed';
            showMessage(message, 'error');
            return { success: false, error: message };
        }
    };

    // Reset password
    const resetPassword = async (email, otp, password) => {
        try {
            const response = await axios.post('/api/auth/reset-password', { email, otp, password });
            showMessage(response.data.message, 'success');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.error || 'Password reset failed';
            showMessage(message, 'error');
            return { success: false, error: message };
        }
    };

    // Update user profile
    const updateProfile = async (profileData) => {
        try {
            const response = await axios.put('/api/users/profile', profileData);
            setUser(response.data.user);
            showMessage('Profile updated successfully!', 'success');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.error || 'Profile update failed';
            showMessage(message, 'error');
            return { success: false, error: message };
        }
    };

    // Delete account
    const deleteAccount = async () => {
        try {
            await axios.delete('/api/users/account');
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            showMessage('Account deleted successfully', 'success');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.error || 'Account deletion failed';
            showMessage(message, 'error');
            return { success: false, error: message };
        }
    };

    const value = {
        user,
        loading,
        register,
        verifyOTP,
        login,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        deleteAccount
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 