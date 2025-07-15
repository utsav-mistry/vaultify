import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../contexts/MessageContext';
import { useTheme } from '../contexts/ThemeContext';
import PixelIcon from '../components/PixelIcon';
import Sidebar from '../components/Sidebar';


const DeviceApproval = () => {
    const { user } = useAuth();
    const { showMessage } = useMessage();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [device, setDevice] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
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
        fetchPendingDevice();
    }, []);

    const fetchPendingDevice = async () => {
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://vaultify-a88w.onrender.com';
            const response = await fetch(`${API_BASE_URL}/api/devices/pending`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'x-device-uid': localStorage.getItem('device_uid')
                }
            });

            if (response.ok) {
                const data = await response.json();
                setDevice(data.device);
                setFetchError(null);
            } else if (response.status === 404) {
                // No pending devices found - this is not an error
                setDevice(null);
                setFetchError(null);
            } else {
                setDevice(null);
                setFetchError('Failed to fetch pending device. Please try again later.');
            }
        } catch (error) {
            setDevice(null);
            setFetchError('Failed to load device. Please check your connection or try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        setActionLoading(true);
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://vaultify-a88w.onrender.com';
            const response = await fetch(`${API_BASE_URL}/api/devices/${device.id}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'x-device-uid': localStorage.getItem('device_uid')
                }
            });
            if (response.ok) {
                showMessage('Device approved successfully', 'success');
                navigate('/devices');
            } else {
                throw new Error('Failed to approve device');
            }
        } catch (error) {
            showMessage('Failed to approve device', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        setActionLoading(true);
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://vaultify-a88w.onrender.com';
            const response = await fetch(`${API_BASE_URL}/api/devices/${device.id}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'x-device-uid': localStorage.getItem('device_uid')
                }
            });
            if (response.ok) {
                showMessage('Device rejected', 'success');
                navigate('/devices');
            } else {
                throw new Error('Failed to reject device');
            }
        } catch (error) {
            showMessage('Failed to reject device', 'error');
        } finally {
            setActionLoading(false);
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
            <div className="device-approval-page">
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
                    <div className="device-approval-header">
                        <h1>Device Approval</h1>
                        <p>Review and approve new device access requests</p>
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
                            <div className="pixel"></div>
                        </div>
                        <div className="loading-text">Loading device...</div>
                    </div>
                </main>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="device-approval-page">
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
                    <div className="device-approval-header">
                        <h1>Device Approval</h1>
                        <p>Review and approve new device access requests</p>
                    </div>
                    <div className="empty-state">
                        <PixelIcon name="alert" />
                        <h3>Error Loading Device</h3>
                        <p>{fetchError}</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!device) {
        return (
            <div className="device-approval-page">
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
                    <div className="device-approval-header">
                        <h1>Device Approval</h1>
                        <p>Review and approve new device access requests</p>
                    </div>
                    <div className="empty-state">
                        <PixelIcon name="device" />
                        <h3>No Pending Devices</h3>
                        <p>There are no devices pending approval.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="device-approval-page">
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
                <div className="device-approval-header">
                    <h1>Device Approval</h1>
                    <p>Review and approve new device access requests</p>
                </div>

                <div className="approval-grid">
                    <div className="approval-card">
                        <div className="approval-header">
                            <h3 className="approval-device-name">{device.device_name || 'Unknown Device'}</h3>
                            <span className="approval-status">Pending Approval</span>
                        </div>

                        <div className="approval-details">
                            <div className="approval-field">
                                <label>Device Type</label>
                                <div className="approval-field-value">
                                    {getDeviceType(device.user_agent)}
                                </div>
                            </div>
                            <div className="approval-field">
                                <label>IP Address</label>
                                <div className="approval-field-value">
                                    {device.ip_address || 'Unknown'}
                                </div>
                            </div>
                            <div className="approval-field">
                                <label>Location</label>
                                <div className="approval-field-value">
                                    {device.location || 'Unknown'}
                                </div>
                            </div>
                            <div className="approval-field">
                                <label>User Agent</label>
                                <div className="approval-field-value">
                                    {device.user_agent || 'Unknown'}
                                </div>
                            </div>
                        </div>

                        <div className="approval-actions">
                            <button
                                className="btn btn-secondary "
                                onClick={handleApprove}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
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
                                    <span>APPROVE DEVICE</span>
                                )}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={handleReject}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
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
                                    <span>REJECT DEVICE</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DeviceApproval; 