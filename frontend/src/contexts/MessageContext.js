import React, { createContext, useContext, useState, useCallback } from 'react';
import MessagePopup from '../components/MessagePopup';

const MessageContext = createContext();

export const useMessage = () => {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error('useMessage must be used within a MessageProvider');
    }
    return context;
};

export const MessageProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);

    const showMessage = useCallback((message, type = 'info', duration = 5000) => {
        const id = Date.now() + Math.random();
        const newMessage = {
            id,
            message,
            type,
            duration
        };

        setMessages(prev => [...prev, newMessage]);
    }, []);

    const removeMessage = useCallback((id) => {
        setMessages(prev => prev.filter(msg => msg.id !== id));
    }, []);

    const showSuccess = useCallback((message, duration) => {
        showMessage(message, 'success', duration);
    }, [showMessage]);

    const showError = useCallback((message, duration) => {
        showMessage(message, 'error', duration);
    }, [showMessage]);

    const showWarning = useCallback((message, duration) => {
        showMessage(message, 'warning', duration);
    }, [showMessage]);

    const showInfo = useCallback((message, duration) => {
        showMessage(message, 'info', duration);
    }, [showMessage]);

    const value = {
        showMessage,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeMessage
    };

    return (
        <MessageContext.Provider value={value}>
            {children}
            {messages.map(msg => (
                <MessagePopup
                    key={msg.id}
                    message={msg.message}
                    type={msg.type}
                    duration={msg.duration}
                    onClose={() => removeMessage(msg.id)}
                />
            ))}
        </MessageContext.Provider>
    );
}; 