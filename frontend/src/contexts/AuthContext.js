import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useMessage } from './MessageContext';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();

    const DEVICE_UID_KEY = 'device_uid';

    // Configure axios defaults
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        // Set device_uid header if present
        const deviceUid = localStorage.getItem(DEVICE_UID_KEY);
        if (deviceUid) {
            axios.defaults.headers.common['x-device-uid'] = deviceUid;
        }
    }, [localStorage.getItem('token'), localStorage.getItem(DEVICE_UID_KEY)]);

    // Check if user is authenticated on app load
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');

            if (token) {
                try {
                    const response = await axios.get('/api/auth/me');
                    setUser(response.data.user);
                } catch (error) {
                    console.error('AuthContext: Auth check failed:', error);
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                }
            }
            setLoading(false);
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

    // Helper to set device_uid securely and log
    const setDeviceUid = (deviceUid) => {
        if (deviceUid) {
            localStorage.setItem(DEVICE_UID_KEY, deviceUid);
            axios.defaults.headers.common['x-device-uid'] = deviceUid;
            document.cookie = `device_uid=${deviceUid}; path=/; SameSite=Strict; Secure`;
            console.log('[Device] device_uid set:', deviceUid);
        }
    };
    // Helper to clear device_uid everywhere and log
    const clearDeviceUid = () => {
        localStorage.removeItem(DEVICE_UID_KEY);
        delete axios.defaults.headers.common['x-device-uid'];
        document.cookie = 'device_uid=; Max-Age=0; path=/; SameSite=Strict; Secure';
        console.log('[Device] device_uid cleared');
    };
    // Helper to get device_uid for API requests
    const getDeviceUidHeader = () => {
        const deviceUid = localStorage.getItem(DEVICE_UID_KEY);
        return deviceUid ? { 'x-device-uid': deviceUid } : {};
    };

    // Login user
    const login = async (credentials) => {
        try {
            // If device_uid exists, include it in the login request headers
            const deviceUid = localStorage.getItem(DEVICE_UID_KEY);
            const config = deviceUid
                ? { headers: { 'x-device-uid': deviceUid } }
                : {};

            const response = await axios.post('/api/auth/login', credentials, config);

            const { token, user } = response.data;

            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);

            // Debug: log all response headers
            console.log('[Device] Login response headers:', response.headers);

            // Store device_uid from response header (if present)
            let newDeviceUid = null;
            if (response.headers) {
                for (const key of Object.keys(response.headers)) {
                    if (key.toLowerCase() === 'x-device-uid') {
                        newDeviceUid = response.headers[key];
                        break;
                    }
                }
            }
            // Fallback: try to extract from Set-Cookie if present
            if (!newDeviceUid && response.headers && response.headers['set-cookie']) {
                const match = response.headers['set-cookie'].match(/device_uid=([^;]+)/);
                if (match) newDeviceUid = match[1];
            }
            if (!newDeviceUid) {
                console.warn('[Device] No device_uid found in login response headers!');
            } else {
                setDeviceUid(newDeviceUid);
            }

            showMessage('Login successful!', 'success');
            return { success: true };
        } catch (error) {
            // Device approval required
            if (error.response?.status === 403 && error.response?.data?.requiresApproval) {
                const message = error.response.data.error || 'Login successful, but this device is pending approval. Please approve it from another device.';
                showMessage(message, 'info');
                // Debug: log all response headers
                if (error.response.headers) {
                    console.log('[Device] Approval response headers:', error.response.headers);
                }
                // Store device_uid from response header if present
                let pendingDeviceUid = null;
                if (error.response.headers) {
                    for (const key of Object.keys(error.response.headers)) {
                        if (key.toLowerCase() === 'x-device-uid') {
                            pendingDeviceUid = error.response.headers[key];
                            break;
                        }
                    }
                }
                // Fallback: try to extract from Set-Cookie if present
                if (!pendingDeviceUid && error.response.headers && error.response.headers['set-cookie']) {
                    const match = error.response.headers['set-cookie'].match(/device_uid=([^;]+)/);
                    if (match) pendingDeviceUid = match[1];
                }
                if (!pendingDeviceUid) {
                    console.warn('[Device] No device_uid found in approval response headers!');
                } else {
                    setDeviceUid(pendingDeviceUid);
                }
                return {
                    success: false,
                    requiresApproval: true,
                    deviceId: error.response.data.deviceId
                };
            }
            // Handle device rejected
            if (error.response?.status === 403 && error.response?.data?.deviceRejected) {
                const message = error.response.data.error;
                showMessage(message, 'error');
                clearDeviceUid();
                return {
                    success: false,
                    error: message,
                    deviceRejected: true
                };
            }
            const message = error.response?.data?.error || 'Login failed';
            showMessage(message, 'error');
            return { success: false, error: message };
        }
    };

    // Logout user
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem(DEVICE_UID_KEY);
        delete axios.defaults.headers.common['Authorization'];
        delete axios.defaults.headers.common['x-device-uid'];
        setUser(null);
        clearDeviceUid();
        showMessage('You have been logged out.', 'info');
        navigate('/login', { replace: true });
    };

    // Force logout and clear device UID (for device removal)
    const forceLogoutAndClearDeviceUid = () => {
        localStorage.removeItem('token');
        localStorage.removeItem(DEVICE_UID_KEY);
        delete axios.defaults.headers.common['Authorization'];
        delete axios.defaults.headers.common['x-device-uid'];
        setUser(null);
        clearDeviceUid();
        showMessage('This device has been removed and you have been logged out.', 'info');
        navigate('/login', { replace: true });
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

    // Check for pending devices
    const checkPendingDevices = async () => {
        try {
            const response = await axios.get('/api/devices/pending');
            return { success: true, device: response.data.device };
        } catch (error) {
            if (error.response?.status === 404) {
                return { success: true, device: null };
            }
            return { success: false, error: error.response?.data?.error || 'Failed to check pending devices' };
        }
    };

    // Approve device
    const approveDevice = async (deviceId) => {
        try {
            const response = await axios.post(`/api/devices/${deviceId}/approve`);
            showMessage('Device approved successfully', 'success');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to approve device';
            showMessage(message, 'error');
            return { success: false, error: message };
        }
    };

    // Reject device
    const rejectDevice = async (deviceId) => {
        try {
            const response = await axios.post(`/api/devices/${deviceId}/reject`);
            showMessage('Device rejected successfully', 'success');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to reject device';
            showMessage(message, 'error');
            return { success: false, error: message };
        }
    };

    // Securely check if the current device is approved
    const checkCurrentDeviceApprovalStatus = async () => {
        const deviceUid = localStorage.getItem(DEVICE_UID_KEY);
        if (!deviceUid) return { success: false, error: 'No device UID found' };
        try {
            // Call a new endpoint that returns only the current device's status
            const response = await axios.get(`/api/devices/status?device_uid=${encodeURIComponent(deviceUid)}`);
            return { success: true, device: response.data.device };
        } catch (error) {
            if (error.response?.status === 404) {
                return { success: true, device: null };
            }
            return { success: false, error: error.response?.data?.error || 'Failed to check device status' };
        }
    };

    const value = {
        user,
        loading,
        register,
        verifyOTP,
        login,
        logout,
        forceLogoutAndClearDeviceUid,
        forgotPassword,
        resetPassword,
        updateProfile,
        deleteAccount,
        checkPendingDevices,
        approveDevice,
        rejectDevice,
        getDeviceUidHeader, // <-- export for use in all API pages
        checkCurrentDeviceApprovalStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 