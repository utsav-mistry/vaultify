import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../contexts/MessageContext';
import { useTheme } from '../contexts/ThemeContext';
import PixelIcon from '../components/PixelIcon';
import Sidebar from '../components/Sidebar';
import WaitingForApproval from '../components/WaitingForApproval';


const DeviceApproval = () => {
    const { user } = useAuth();
    const { showMessage } = useMessage();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [devices, setDevices] = useState([]);
    const [actionLoading, setActionLoading] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarAreaHovered, setSidebarAreaHovered] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const { getDeviceUidHeader } = useAuth();


    useEffect(() => {
        if (sidebarAreaHovered) setSidebarOpen(true);
        else setSidebarOpen(false);
    }, [sidebarAreaHovered]);

    const handleSidebarEnter = () => setSidebarAreaHovered(true);
    const handleSidebarLeave = () => setSidebarAreaHovered(false);

    useEffect(() => {
        fetchPendingDevices();
    }, []);

    const fetchPendingDevices = async () => {
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://vaultify-a88w.onrender.com';
            const headers = {
                ...getDeviceUidHeader(),
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            };
            console.log('[Device] Sending x-device-uid header:', headers['x-device-uid']);
            const response = await fetch(`${API_BASE_URL}/api/devices/pending`, {
                headers
            });

            if (response.ok) {
                const data = await response.json();
                setDevices(data.devices || []);
                setFetchError(null);
            } else if (response.status === 404) {
                setDevices([]);
                setFetchError(null);
            } else {
                setDevices([]);
                setFetchError('Failed to fetch pending devices. Please try again later.');
            }
        } catch (error) {
            setDevices([]);
            setFetchError('Failed to load devices. Please check your connection or try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (deviceId) => {
        setActionLoading({ id: deviceId, action: 'approve' });
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
                fetchPendingDevices();
            } else {
                throw new Error('Failed to approve device');
            }
        } catch (error) {
            showMessage('Failed to approve device', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (deviceId) => {
        setActionLoading({ id: deviceId, action: 'reject' });
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
                showMessage('Device rejected', 'success');
                fetchPendingDevices();
            } else {
                throw new Error('Failed to reject device');
            }
        } catch (error) {
            showMessage('Failed to reject device', 'error');
        } finally {
            setActionLoading(null);
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
                        <div className="loading-text">Loading devices...</div>
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

    if (!devices || devices.length === 0) {
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
        <div className="device-approval-page" style={{ minHeight: '100vh', background: '#fff' }}>
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
            <main className={sidebarOpen ? 'blurred' : ''} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0' }}>
                <div className="device-approval-header" style={{ marginBottom: 32, textAlign: 'center' }}>
                    <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111', marginBottom: 8 }}>Device Approval</h1>
                    <p style={{ color: '#444', fontSize: 18 }}>Review and approve new device access requests</p>
                </div>
                <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center' }}>
                    {devices.map((device) => (
                        <div className="approval-card" key={device.id} style={{ width: '100%', background: '#fff', border: '1px solid #eee', borderRadius: 0, padding: 28, margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'stretch', boxShadow: 'none', animation: 'none', transition: 'none' }}>
                            <div className="approval-header" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h3 className="approval-device-name" style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>{device.device_name || 'Unknown Device'}</h3>
                                <span className="approval-status" style={{ color: '#222', fontWeight: 500, fontSize: 14, background: '#f5f5f5', borderRadius: 6, padding: '2px 10px', marginLeft: 12 }}>Pending Approval</span>
                            </div>
                            <div className="approval-details" style={{ marginBottom: 18, color: '#222', fontSize: 15 }}>
                                <div className="approval-field" style={{ marginBottom: 6 }}><label style={{ color: '#888', fontWeight: 500 }}>Device Type</label><div className="approval-field-value">{getDeviceType(device.user_agent)}</div></div>
                                <div className="approval-field" style={{ marginBottom: 6 }}><label style={{ color: '#888', fontWeight: 500 }}>IP Address</label><div className="approval-field-value">{device.ip_address || 'Unknown'}</div></div>
                                <div className="approval-field" style={{ marginBottom: 6 }}><label style={{ color: '#888', fontWeight: 500 }}>Location</label><div className="approval-field-value">{device.location || 'Unknown'}</div></div>
                                <div className="approval-field"><label style={{ color: '#888', fontWeight: 500 }}>User Agent</label><div className="approval-field-value">{device.user_agent || 'Unknown'}</div></div>
                            </div>
                            <div className="approval-actions" style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => handleApprove(device.id)}
                                    disabled={actionLoading && actionLoading.id === device.id && actionLoading.action === 'approve'}
                                >
                                    {actionLoading && actionLoading.id === device.id && actionLoading.action === 'approve' ? (
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
                                    onClick={() => handleReject(device.id)}
                                    disabled={actionLoading && actionLoading.id === device.id && actionLoading.action === 'reject'}
                                >
                                    {actionLoading && actionLoading.id === device.id && actionLoading.action === 'reject' ? (
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
                    ))}
                </div>
            </main>
        </div>
    );
};

export default DeviceApproval; 