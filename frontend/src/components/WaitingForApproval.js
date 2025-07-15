import React, { useEffect, useState } from 'react';

const WaitingForApproval = () => {
    const [secondsLeft, setSecondsLeft] = useState(300); // 5 minutes

    useEffect(() => {
        if (secondsLeft <= 0) return;
        const interval = setInterval(() => {
            setSecondsLeft((s) => s - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [secondsLeft]);

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