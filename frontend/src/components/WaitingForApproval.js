import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../contexts/MessageContext';

const POLL_INTERVAL = 4000; // 4 seconds

const WaitingForApproval = () => {
    const [secondsLeft, setSecondsLeft] = useState(300); // 5 minutes
    const { checkCurrentDeviceApprovalStatus } = useAuth();
    const navigate = useNavigate();
    const pollingRef = useRef();
    const { showMessage } = useMessage();

    // Countdown timer
    useEffect(() => {
        if (secondsLeft <= 0) return;
        const interval = setInterval(() => {
            setSecondsLeft((s) => s - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [secondsLeft]);

    // Poll for device approval
    useEffect(() => {
        if (secondsLeft <= 0) return;
        pollingRef.current = setInterval(async () => {
            try {
                const result = await checkCurrentDeviceApprovalStatus();
                // If device is approved, redirect
                if (result.success && result.device && result.device.is_approved) {
                    clearInterval(pollingRef.current);
                    showMessage('Device approved! You now have access.', 'success');
                    navigate('/dashboard', { replace: true });
                }
                // If device is rejected, force logout
                if (result.success && result.device && result.device.is_rejected) {
                    clearInterval(pollingRef.current);
                    showMessage('This device was rejected. Please use another device or contact support.', 'error');
                    navigate('/login', { replace: true });
                }
                // If device is deleted (not found), force logout
                if (result.success && !result.device) {
                    clearInterval(pollingRef.current);
                    showMessage('This device was removed and you have been logged out.', 'error');
                    navigate('/login', { replace: true });
                }
            } catch (e) {
                // Ignore errors, keep polling
            }
        }, POLL_INTERVAL);
        return () => clearInterval(pollingRef.current);
    }, [checkCurrentDeviceApprovalStatus, navigate, secondsLeft, showMessage]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    return (
        <div className="waiting-approval-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="pixelated-spinner" style={{ marginBottom: 32 }}>
                <div className="pixel"></div>
                <div className="pixel"></div>
                <div className="pixel"></div>
                <div className="pixel"></div>
                <div className="pixel"></div>
                <div className="pixel"></div>
                <div className="pixel"></div>
                <div className="pixel"></div>
            </div>
            <h2 style={{ marginBottom: 16 }}>Waiting for Device Approval</h2>
            <p style={{ marginBottom: 24, textAlign: 'center' }}>
                Please approve this device from another authorized device.<br />
                This page will refresh automatically once approved.
            </p>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
                Time left: {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
        </div>
    );
};

export default WaitingForApproval; 