import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../contexts/MessageContext';
import { useTheme } from '../contexts/ThemeContext';
import PixelIcon from '../components/PixelIcon';
import Sidebar from '../components/Sidebar';

const Devices = () => {
    const { user } = useAuth();
    const { showMessage } = useMessage();
    const { theme } = useTheme();

    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarAreaHovered, setSidebarAreaHovered] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        if (sidebarAreaHovered) setSidebarOpen(true);
        else setSidebarOpen(false);
    }, [sidebarAreaHovered]);

    const handleSidebarEnter = () => setSidebarAreaHovered(true);
    const handleSidebarLeave = () => setSidebarAreaHovered(false);

    useEffect(() => {
        fetchDevices();
    }, []);

    const { getDeviceUidHeader } = useAuth();

    const fetchDevices = async () => {
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://vaultify-a88w.onrender.com';
            const headers = {
                ...getDeviceUidHeader(),
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            };
            console.log('[Device] Sending x-device-uid header:', headers['x-device-uid']);
            const response = await fetch(`${API_BASE_URL}/api/devices`, {
                headers
            });

            if (response.ok) {
                const data = await response.json();
                setDevices(data.devices || []);
                setFetchError(null);
            } else {
                const errorData = await response.json();
                setFetchError(errorData.error || 'Failed to fetch devices. Please try again later.');
            }
        } catch (error) {
            console.error('Fetch devices error:', error);
            setFetchError('Failed to load devices. Please check your connection or try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveDevice = async (deviceId) => {
        setActionLoading(deviceId);
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://vaultify-a88w.onrender.com';
            const headers = {
                ...getDeviceUidHeader(),
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            };
            console.log('[Device] Sending x-device-uid header:', headers['x-device-uid']);
            const response = await fetch(`${API_BASE_URL}/api/devices/${deviceId}/approve`, {
                method: 'POST',
                headers
            });

            if (response.ok) {
                showMessage('Device approved successfully', 'success');
                fetchDevices();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to approve device');
            }
        } catch (error) {
            showMessage(error.message || 'Failed to approve device', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectDevice = async (deviceId) => {
        setActionLoading(deviceId);
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://vaultify-a88w.onrender.com';
            const headers = {
                ...getDeviceUidHeader(),
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            };
            console.log('[Device] Sending x-device-uid header:', headers['x-device-uid']);
            const response = await fetch(`${API_BASE_URL}/api/devices/${deviceId}/reject`, {
                method: 'POST',
                headers
            });

            if (response.ok) {
                showMessage('Device rejected successfully', 'success');
                fetchDevices();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to reject device');
            }
        } catch (error) {
            showMessage(error.message || 'Failed to reject device', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemoveDevice = async (deviceId) => {
        if (!window.confirm('Are you sure you want to remove this device?')) {
            return;
        }

        setActionLoading(deviceId);
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://vaultify-a88w.onrender.com';
            const headers = {
                ...getDeviceUidHeader(),
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            };
            console.log('[Device] Sending x-device-uid header:', headers['x-device-uid']);
            const response = await fetch(`${API_BASE_URL}/api/devices/${deviceId}`, {
                method: 'DELETE',
                headers
            });

            if (response.ok) {
                showMessage('Device removed successfully', 'success');
                fetchDevices();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to remove device');
            }
        } catch (error) {
            showMessage(error.message || 'Failed to remove device', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const getDeviceIcon = (deviceType) => {
        switch (deviceType?.toLowerCase()) {
            case 'mobile':
                return 'mobile';
            case 'tablet':
                return 'tablet';
            case 'desktop':
                return 'desktop';
            default:
                return 'device';
        }
    };

    const getStatusBadge = (device) => {
        if (device.is_approved === true) {
            return <span className="device-status active">Active</span>;
        } else if (device.is_rejected === true) {
            return <span className="device-status inactive">Rejected</span>;
        } else {
            return <span className="device-status inactive">Pending</span>;
        }
    };

    const getDeviceType = (userAgent) => {
        if (!userAgent) return 'Unknown';
        const ua = userAgent.toLowerCase();
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            return 'Mobile';
        } else if (ua.includes('tablet') || ua.includes('ipad')) {
            return 'Tablet';
        } else {
            return 'Desktop';
        }
    };

    if (loading) {
        return (
            <div className="devices-page">
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
                    <div className="devices-header">
                        <h1>Device Management</h1>
                        <p>Manage your connected devices and security</p>
                    </div>
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
                        <div className="loading-text">Loading devices...</div>
                    </div>
                </main>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="devices-page">
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
                    <div className="devices-header">
                        <h1>Device Management</h1>
                        <p>Manage your connected devices and security</p>
                    </div>
                    <div className="empty-state">
                        <PixelIcon name="alert" />
                        <h3>Error Loading Devices</h3>
                        <p>{fetchError}</p>
                        <button className="btn btn-primary" onClick={fetchDevices}>
                            <span>Try Again</span>
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="devices-page">
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
                <div className="devices-header">
                    <h1>Device Management</h1>
                    <p>Manage your connected devices and security</p>
                </div>

                {devices.length === 0 ? (
                    <div className="empty-state">
                        <PixelIcon name="device" />
                        <h3>No Devices Found</h3>
                        <p>No devices are currently connected to your account.</p>
                    </div>
                ) : (
                    <div className="devices-grid">
                        {devices.map((device) => (
                            <div key={device.id} className="device-card">
                                <div className="device-header">
                                    <h3 className="device-name">{device.device_name || 'Unknown Device'}</h3>
                                    {getStatusBadge(device)}
                                </div>

                                <div className="device-details">
                                    <div className="device-field">
                                        <label>Device Type</label>
                                        <div className="device-field-value">
                                            {getDeviceType(device.user_agent)}
                                        </div>
                                    </div>
                                    <div className="device-field">
                                        <label>IP Address</label>
                                        <div className="device-field-value">
                                            {device.ip_address || 'Unknown'}
                                        </div>
                                    </div>
                                    <div className="device-field">
                                        <label>Location</label>
                                        <div className="device-field-value">
                                            {device.location || 'Unknown'}
                                        </div>
                                    </div>
                                    <div className="device-field">
                                        <label>Last Activity</label>
                                        <div className="device-field-value">
                                            {device.last_used ? new Date(device.last_used).toLocaleString() : 'Never'}
                                        </div>
                                    </div>
                                </div>

                                <div className="device-actions">
                                    {device.is_approved === null && device.is_rejected !== true && (
                                        <>
                                            <button
                                                lassName="btn btn-primary btn-sm"
                                                onClick={() => handleApproveDevice(device.id)}
                                                disabled={actionLoading === device.id}
                                            >
                                                {actionLoading === device.id ? (
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
                                                    <span>Approve</span>
                                                )}
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleRejectDevice(device.id)}
                                                disabled={actionLoading === device.id}
                                            >
                                                {actionLoading === device.id ? (
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
                                                    <span>Reject</span>
                                                )}
                                            </button>
                                        </>
                                    )}

                                    {device.is_approved === true && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleRemoveDevice(device.id)}
                                            disabled={actionLoading === device.id}
                                        >
                                            {actionLoading === device.id ? (
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
                                                <span>LOGOUT</span>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Devices; 