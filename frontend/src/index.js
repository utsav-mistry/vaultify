import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { MessageProvider } from './contexts/MessageContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <ThemeProvider>
            <MessageProvider>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </MessageProvider>
        </ThemeProvider>
    </BrowserRouter>
); 