import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import PixelIcon from './PixelIcon';

const MessagePopup = ({ message, type = 'info', duration = 5000, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        // Show the message
        const showTimer = setTimeout(() => {
            setIsVisible(true);
        }, 100);

        // Auto-hide after duration
        const hideTimer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
                onClose();
            }, 300); // Wait for animation to complete
        }, duration);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, [duration, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return 'check';
            case 'error':
                return 'exclamation';
            case 'warning':
                return 'triangle';
            case 'info':
            default:
                return 'info';
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'success':
                return 'Success';
            case 'error':
                return 'Error';
            case 'warning':
                return 'Warning';
            case 'info':
            default:
                return 'Information';
        }
    };

    return (
        <div className={`message-popup ${type} ${isVisible ? 'show' : ''}`}>
            <div className="message-header">
                <div className="d-flex align-items-center">
                    <PixelIcon
                        type={getIcon()}
                        size={16}
                        style={{ marginRight: 'var(--spacing-sm)' }}
                    />
                    <span className="message-title">{getTitle()}</span>
                </div>
                <button className="message-close" onClick={handleClose}>
                    <PixelIcon type="times" size={12} />
                </button>
            </div>
            <div className="message-content">
                {message}
            </div>
        </div>
    );
};

export default MessagePopup; 