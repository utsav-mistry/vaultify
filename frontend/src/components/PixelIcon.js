import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const PixelIcon = ({ type, size = 16, className = '' }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const color = isDark ? '#ffffff' : '#000000';

    // Calculate pixel size based on icon size for bigger pixels
    const pixelSize = Math.max(3, Math.floor(size / 6));

    const getIconPath = () => {
        switch (type) {
            case 'key':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="8" width="12" height="8" fill={color} />
                        <rect x="8" y="6" width="8" height="4" fill={color} />
                        <rect x="10" y="10" width="4" height="4" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="12" y="12" width="2" height="2" fill={color} />
                        <rect x="14" y="10" width="2" height="2" fill={color} />
                        <rect x="16" y="8" width="2" height="2" fill={color} />
                    </svg>
                );
            case 'lock':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="10" width="12" height="10" fill={color} />
                        <rect x="8" y="8" width="8" height="4" fill={color} />
                        <rect x="10" y="12" width="4" height="6" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="11" y="14" width="2" height="2" fill={color} />
                    </svg>
                );
            case 'user':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Mario-style user with pixelated features */}
                        <rect x="8" y="6" width="8" height="6" fill={color} />
                        <rect x="6" y="14" width="12" height="6" fill={color} />
                        {/* Pixelated eyes */}
                        <rect x="10" y="8" width={pixelSize} height={pixelSize} fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="14" y="8" width={pixelSize} height={pixelSize} fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        {/* Pixelated body details */}
                        <rect x="9" y="16" width="6" height={pixelSize} fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="10" y="18" width="4" height={pixelSize} fill={isDark ? '#1a1a1a' : '#ffffff'} />
                    </svg>
                );
            case 'menu':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="6" width="16" height="2" fill={color} />
                        <rect x="4" y="11" width="16" height="2" fill={color} />
                        <rect x="4" y="16" width="16" height="2" fill={color} />
                    </svg>
                );
            case 'sun':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="10" width="4" height="4" fill={color} />
                        <rect x="11" y="2" width="2" height="4" fill={color} />
                        <rect x="11" y="18" width="2" height="4" fill={color} />
                        <rect x="2" y="11" width="4" height="2" fill={color} />
                        <rect x="18" y="11" width="4" height="2" fill={color} />
                        <rect x="4" y="4" width="2" height="2" fill={color} />
                        <rect x="18" y="18" width="2" height="2" fill={color} />
                        <rect x="4" y="18" width="2" height="2" fill={color} />
                        <rect x="18" y="4" width="2" height="2" fill={color} />
                    </svg>
                );
            case 'moon':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="12" y="4" width="8" height="8" fill={color} />
                        <rect x="8" y="8" width="8" height="8" fill={color} />
                        <rect x="4" y="12" width="8" height="8" fill={color} />
                        <rect x="14" y="6" width="4" height="4" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="10" y="10" width="4" height="4" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="6" y="14" width="4" height="4" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                    </svg>
                );
            case 'devices':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="4" width="8" height="12" fill={color} />
                        <rect x="14" y="6" width="8" height="10" fill={color} />
                        <rect x="3" y="5" width="6" height="10" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="15" y="7" width="6" height="8" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="5" y="17" width="2" height="2" fill={color} />
                        <rect x="17" y="17" width="2" height="2" fill={color} />
                    </svg>
                );
            case 'upload':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="4" width="4" height="12" fill={color} />
                        <rect x="8" y="8" width="2" height="2" fill={color} />
                        <rect x="14" y="8" width="2" height="2" fill={color} />
                        <rect x="4" y="16" width="16" height="2" fill={color} />
                    </svg>
                );
            case 'download':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Mario-style download arrow */}
                        <rect x="10" y="4" width="4" height="12" fill={color} />
                        {/* Pixelated arrow head */}
                        <rect x="8" y="12" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="14" y="12" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="6" y="14" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="16" y="14" width={pixelSize} height={pixelSize} fill={color} />
                        {/* Pixelated base */}
                        <rect x="4" y="20" width="16" height={pixelSize} fill={color} />
                        <rect x="6" y="18" width="12" height={pixelSize} fill={color} />
                    </svg>
                );
            case 'eye-off':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="8" width="20" height="8" fill={color} />
                        <rect x="8" y="10" width="8" height="4" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="10" y="11" width="4" height="2" fill={color} />
                        <rect x="2" y="2" width="2" height="2" fill={color} />
                        <rect x="20" y="20" width="2" height="2" fill={color} />
                        <rect x="4" y="20" width="2" height="2" fill={color} />
                        <rect x="20" y="2" width="2" height="2" fill={color} />
                    </svg>
                );
            case 'search':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="8" y="8" width="8" height="8" fill="none" stroke={color} strokeWidth="2" />
                        <rect x="14" y="14" width="4" height="4" fill={color} />
                        <rect x="15" y="15" width="2" height="2" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                    </svg>
                );
            case 'activity':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="12" width="4" height="8" fill={color} />
                        <rect x="6" y="8" width="4" height="12" fill={color} />
                        <rect x="10" y="4" width="4" height="16" fill={color} />
                        <rect x="14" y="10" width="4" height="10" fill={color} />
                        <rect x="18" y="6" width="4" height="14" fill={color} />
                    </svg>
                );
            case 'plus':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="4" width="4" height="16" fill={color} />
                        <rect x="4" y="10" width="16" height="4" fill={color} />
                    </svg>
                );
            case 'edit':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Mario-style edit with pixelated pencil */}
                        <rect x="4" y="4" width="16" height="16" fill="none" stroke={color} strokeWidth="2" />
                        <rect x="8" y="8" width="8" height="8" fill={color} />
                        <rect x="10" y="10" width="4" height="4" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        {/* Pixelated pencil tip */}
                        <rect x="16" y="2" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="18" y="4" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="20" y="6" width={pixelSize} height={pixelSize} fill={color} />
                        {/* Pixelated pencil body */}
                        <rect x="14" y="4" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="12" y="6" width={pixelSize} height={pixelSize} fill={color} />
                    </svg>
                );
            case 'trash':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="6" width="12" height="2" fill={color} />
                        <rect x="8" y="8" width="8" height="12" fill={color} />
                        <rect x="10" y="10" width="4" height="8" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="9" y="4" width="2" height="2" fill={color} />
                        <rect x="13" y="4" width="2" height="2" fill={color} />
                    </svg>
                );
            case 'copy':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="8" y="8" width="12" height="12" fill="none" stroke={color} strokeWidth="2" />
                        <rect x="4" y="4" width="12" height="12" fill={color} />
                        <rect x="6" y="6" width="8" height="8" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                    </svg>
                );
            case 'save':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="16" height="16" fill={color} />
                        <rect x="6" y="6" width="12" height="8" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="8" y="16" width="8" height="2" fill={color} />
                        <rect x="8" y="4" width="8" height="2" fill={color} />
                    </svg>
                );
            case 'magic':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="2" width="4" height="4" fill={color} />
                        <rect x="8" y="6" width="2" height="2" fill={color} />
                        <rect x="14" y="6" width="2" height="2" fill={color} />
                        <rect x="6" y="8" width="2" height="2" fill={color} />
                        <rect x="16" y="8" width="2" height="2" fill={color} />
                        <rect x="4" y="10" width="2" height="2" fill={color} />
                        <rect x="18" y="10" width="2" height="2" fill={color} />
                        <rect x="2" y="12" width="2" height="2" fill={color} />
                        <rect x="20" y="12" width="2" height="2" fill={color} />
                        <rect x="4" y="14" width="2" height="2" fill={color} />
                        <rect x="18" y="14" width="2" height="2" fill={color} />
                        <rect x="6" y="16" width="2" height="2" fill={color} />
                        <rect x="16" y="16" width="2" height="2" fill={color} />
                        <rect x="8" y="18" width="2" height="2" fill={color} />
                        <rect x="14" y="18" width="2" height="2" fill={color} />
                        <rect x="10" y="20" width="4" height="2" fill={color} />
                    </svg>
                );
            case 'check':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="16" height="16" fill="none" stroke={color} strokeWidth="2" />
                        <rect x="8" y="8" width="2" height="2" fill={color} />
                        <rect x="10" y="10" width="2" height="2" fill={color} />
                        <rect x="12" y="12" width="2" height="2" fill={color} />
                        <rect x="14" y="10" width="2" height="2" fill={color} />
                        <rect x="16" y="8" width="2" height="2" fill={color} />
                    </svg>
                );
            case 'exclamation':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="4" width="4" height="12" fill={color} />
                        <rect x="10" y="18" width="4" height="2" fill={color} />
                    </svg>
                );
            case 'info':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="4" width="4" height="4" fill={color} />
                        <rect x="10" y="10" width="4" height="10" fill={color} />
                    </svg>
                );
            case 'times':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="6" width="2" height="2" fill={color} />
                        <rect x="8" y="8" width="2" height="2" fill={color} />
                        <rect x="10" y="10" width="2" height="2" fill={color} />
                        <rect x="12" y="12" width="2" height="2" fill={color} />
                        <rect x="14" y="10" width="2" height="2" fill={color} />
                        <rect x="16" y="8" width="2" height="2" fill={color} />
                        <rect x="18" y="6" width="2" height="2" fill={color} />
                        <rect x="10" y="14" width="2" height="2" fill={color} />
                        <rect x="8" y="16" width="2" height="2" fill={color} />
                        <rect x="6" y="18" width="2" height="2" fill={color} />
                        <rect x="14" y="14" width="2" height="2" fill={color} />
                        <rect x="16" y="16" width="2" height="2" fill={color} />
                        <rect x="18" y="18" width="2" height="2" fill={color} />
                    </svg>
                );
            case 'eye':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="8" width="20" height="8" fill={color} />
                        <rect x="8" y="10" width="8" height="4" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="10" y="11" width="4" height="2" fill={color} />
                    </svg>
                );
            case 'eye-slash':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="8" width="20" height="8" fill={color} />
                        <rect x="8" y="10" width="8" height="4" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="10" y="11" width="4" height="2" fill={color} />
                        <rect x="2" y="2" width="2" height="2" fill={color} />
                        <rect x="20" y="20" width="2" height="2" fill={color} />
                        <rect x="4" y="20" width="2" height="2" fill={color} />
                        <rect x="20" y="2" width="2" height="2" fill={color} />
                    </svg>
                );
            case 'settings':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="10" width="4" height="4" fill={color} />
                        <rect x="8" y="8" width="2" height="2" fill={color} />
                        <rect x="14" y="8" width="2" height="2" fill={color} />
                        <rect x="8" y="14" width="2" height="2" fill={color} />
                        <rect x="14" y="14" width="2" height="2" fill={color} />
                        <rect x="6" y="10" width="2" height="4" fill={color} />
                        <rect x="16" y="10" width="2" height="4" fill={color} />
                        <rect x="10" y="6" width="4" height="2" fill={color} />
                        <rect x="10" y="16" width="4" height="2" fill={color} />
                    </svg>
                );
            case 'unlock':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="10" width="12" height="10" fill={color} />
                        <rect x="8" y="8" width="8" height="4" fill={color} />
                        <rect x="10" y="12" width="4" height="6" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="11" y="14" width="2" height="2" fill={color} />
                        <rect x="8" y="6" width="8" height="2" fill={color} />
                    </svg>
                );
            case 'star':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Mario-style star with visible pixel steps */}
                        <rect x="12" y="2" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="10" y="4" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="14" y="4" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="8" y="6" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="16" y="6" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="6" y="8" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="18" y="8" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="4" y="10" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="20" y="10" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="2" y="12" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="22" y="12" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="4" y="14" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="20" y="14" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="6" y="16" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="18" y="16" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="8" y="18" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="16" y="18" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="10" y="20" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="14" y="20" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="12" y="22" width={pixelSize} height={pixelSize} fill={color} />
                    </svg>
                );
            case 'device':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Mario-style device with pixelated screen */}
                        <rect x="2" y="4" width="20" height="14" fill={color} />
                        <rect x="4" y="6" width="16" height="10" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        {/* Pixelated stand */}
                        <rect x="8" y="20" width="8" height={pixelSize} fill={color} />
                        <rect x="10" y="18" width="4" height={pixelSize} fill={color} />
                        {/* Pixelated screen elements */}
                        <rect x="6" y="8" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="18" y="8" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="6" y="16" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="18" y="16" width={pixelSize} height={pixelSize} fill={color} />
                    </svg>
                );
            case 'database':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Mario-style database with pixelated layers */}
                        <rect x="3" y="4" width="18" height="4" fill={color} />
                        <rect x="5" y="6" width="14" height={pixelSize} fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="3" y="10" width="18" height="4" fill={color} />
                        <rect x="5" y="12" width="14" height={pixelSize} fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="3" y="16" width="18" height="4" fill={color} />
                        <rect x="5" y="18" width="14" height={pixelSize} fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        {/* Pixelated data elements */}
                        <rect x="7" y="8" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="17" y="8" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="7" y="14" width={pixelSize} height={pixelSize} fill={color} />
                        <rect x="17" y="14" width={pixelSize} height={pixelSize} fill={color} />
                    </svg>
                );
            case 'mail':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Mario-style mail with pixelated envelope */}
                        <rect x="2" y="6" width="20" height="12" fill={color} />
                        <rect x="4" y="8" width="16" height="8" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        {/* Pixelated mail lines */}
                        <rect x="12" y="10" width="8" height={pixelSize} fill={color} />
                        <rect x="12" y="12" width="8" height={pixelSize} fill={color} />
                        <rect x="12" y="14" width="4" height={pixelSize} fill={color} />
                        {/* Pixelated envelope flap */}
                        <rect x="4" y="6" width="16" height={pixelSize} fill={color} />
                        <rect x="6" y="4" width="12" height={pixelSize} fill={color} />
                        <rect x="8" y="2" width="8" height={pixelSize} fill={color} />
                    </svg>
                );
            case 'clock':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="2" width="20" height="20" fill="none" stroke={color} strokeWidth="2" />
                        <rect x="10" y="6" width="4" height="2" fill={color} />
                        <rect x="14" y="10" width="2" height="2" fill={color} />
                        <rect x="12" y="12" width="2" height="2" fill={color} />
                        <rect x="10" y="14" width="2" height="2" fill={color} />
                    </svg>
                );
            case 'globe':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="2" width="20" height="20" fill="none" stroke={color} strokeWidth="2" />
                        <rect x="2" y="8" width="20" height="2" fill={color} />
                        <rect x="2" y="14" width="20" height="2" fill={color} />
                        <rect x="8" y="2" width="2" height="20" fill={color} />
                        <rect x="14" y="2" width="2" height="20" fill={color} />
                    </svg>
                );
            case 'home':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="8" width="16" height="12" fill={color} />
                        <rect x="6" y="10" width="12" height="8" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="10" y="4" width="4" height="6" fill={color} />
                        <rect x="11" y="6" width="2" height="2" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="8" y="14" width="2" height="2" fill={color} />
                        <rect x="14" y="14" width="2" height="2" fill={color} />
                    </svg>
                );
            case 'dashboard':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="2" width="8" height="8" fill={color} />
                        <rect x="14" y="2" width="8" height="8" fill={color} />
                        <rect x="2" y="14" width="8" height="8" fill={color} />
                        <rect x="14" y="14" width="8" height="8" fill={color} />
                        <rect x="4" y="4" width="4" height="4" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="16" y="4" width="4" height="4" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="4" y="16" width="4" height="4" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="16" y="16" width="4" height="4" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                    </svg>
                );
            case 'shield':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Mario-style shield with pixelated design */}
                        <rect x="4" y="4" width="16" height="16" fill={color} />
                        <rect x="6" y="6" width="12" height="8" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="8" y="8" width="8" height="4" fill={color} />
                        <rect x="10" y="10" width="4" height={pixelSize} fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        {/* Pixelated shield details */}
                        <rect x="6" y="4" width="12" height={pixelSize} fill={color} />
                        <rect x="8" y="2" width="8" height={pixelSize} fill={color} />
                        <rect x="10" y="0" width="4" height={pixelSize} fill={color} />
                    </svg>
                );
            case 'folder':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Mario-style folder with pixelated design */}
                        <rect x="4" y="8" width="16" height="10" fill={color} />
                        <rect x="6" y="10" width="12" height="6" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        {/* Pixelated folder tab */}
                        <rect x="8" y="4" width="8" height={pixelSize} fill={color} />
                        <rect x="10" y="6" width="4" height={pixelSize} fill={color} />
                        {/* Pixelated folder bottom */}
                        <rect x="6" y="18" width="12" height={pixelSize} fill={color} />
                        {/* Pixelated folder left and right edges */}
                        <rect x="4" y="10" width={pixelSize} height="6" fill={color} />
                        <rect x="20" y="10" width={pixelSize} height="6" fill={color} />
                    </svg>
                );
            case 'paint-brush':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="16" height="16" fill={color} />
                        <rect x="6" y="6" width="12" height="12" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="8" y="8" width="8" height="8" fill={color} />
                        <rect x="10" y="10" width="4" height="4" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="18" y="2" width="2" height="2" fill={color} />
                        <rect x="20" y="4" width="2" height="2" fill={color} />
                    </svg>
                );
            case 'cog':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="10" width="4" height="4" fill={color} />
                        <rect x="8" y="8" width="2" height="2" fill={color} />
                        <rect x="14" y="8" width="2" height="2" fill={color} />
                        <rect x="8" y="14" width="2" height="2" fill={color} />
                        <rect x="14" y="14" width="2" height="2" fill={color} />
                        <rect x="6" y="10" width="2" height="4" fill={color} />
                        <rect x="16" y="10" width="2" height="4" fill={color} />
                        <rect x="10" y="6" width="4" height="2" fill={color} />
                        <rect x="10" y="16" width="4" height="2" fill={color} />
                    </svg>
                );
            case 'rocket':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="4" width="4" height="16" fill={color} />
                        <rect x="8" y="6" width="2" height="2" fill={color} />
                        <rect x="14" y="6" width="2" height="2" fill={color} />
                        <rect x="6" y="8" width="2" height="2" fill={color} />
                        <rect x="16" y="8" width="2" height="2" fill={color} />
                        <rect x="4" y="10" width="2" height="2" fill={color} />
                        <rect x="18" y="10" width="2" height="2" fill={color} />
                        <rect x="2" y="12" width="2" height="2" fill={color} />
                        <rect x="20" y="12" width="2" height="2" fill={color} />
                        <rect x="8" y="20" width="8" height="2" fill={color} />
                        <rect x="10" y="18" width="4" height="2" fill={color} />
                    </svg>
                );
            case 'flask':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="8" y="4" width="8" height="16" fill={color} />
                        <rect x="10" y="6" width="4" height="12" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="12" y="8" width="2" height="2" fill={color} />
                        <rect x="10" y="12" width="4" height="2" fill={color} />
                        <rect x="8" y="16" width="8" height="2" fill={color} />
                    </svg>
                );
            case 'code':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="16" height="16" fill={color} />
                        <rect x="6" y="6" width="12" height="12" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="8" y="8" width="2" height="2" fill={color} />
                        <rect x="10" y="8" width="2" height="2" fill={color} />
                        <rect x="12" y="8" width="2" height="2" fill={color} />
                        <rect x="14" y="8" width="2" height="2" fill={color} />
                        <rect x="8" y="10" width="2" height="2" fill={color} />
                        <rect x="12" y="10" width="2" height="2" fill={color} />
                        <rect x="8" y="12" width="2" height="2" fill={color} />
                        <rect x="12" y="12" width="2" height="2" fill={color} />
                        <rect x="8" y="14" width="2" height="2" fill={color} />
                        <rect x="10" y="14" width="2" height="2" fill={color} />
                        <rect x="12" y="14" width="2" height="2" fill={color} />
                        <rect x="14" y="14" width="2" height="2" fill={color} />
                    </svg>
                );
            case 'lightbulb':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="8" y="4" width="8" height="12" fill={color} />
                        <rect x="10" y="6" width="4" height="8" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="10" y="16" width="4" height="2" fill={color} />
                        <rect x="8" y="18" width="8" height="2" fill={color} />
                        <rect x="10" y="20" width="4" height="2" fill={color} />
                        <rect x="12" y="22" width="2" height="2" fill={color} />
                    </svg>
                );
            case 'brain':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="6" width="12" height="12" fill={color} />
                        <rect x="8" y="8" width="8" height="8" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="10" y="10" width="4" height="4" fill={color} />
                        <rect x="12" y="12" width="2" height="2" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="8" y="4" width="2" height="2" fill={color} />
                        <rect x="14" y="4" width="2" height="2" fill={color} />
                        <rect x="8" y="18" width="2" height="2" fill={color} />
                        <rect x="14" y="18" width="2" height="2" fill={color} />
                    </svg>
                );
            case 'microscope':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="8" width="16" height="8" fill={color} />
                        <rect x="6" y="10" width="12" height="4" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="8" y="12" width="8" height="2" fill={color} />
                        <rect x="10" y="4" width="4" height="4" fill={color} />
                        <rect x="12" y="6" width="2" height="2" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="8" y="18" width="8" height="2" fill={color} />
                        <rect x="10" y="20" width="4" height="2" fill={color} />
                    </svg>
                );
            case 'hammer':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="16" height="16" fill={color} />
                        <rect x="6" y="6" width="12" height="12" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="8" y="8" width="8" height="8" fill={color} />
                        <rect x="10" y="10" width="4" height="4" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="2" y="2" width="2" height="2" fill={color} />
                        <rect x="20" y="2" width="2" height="2" fill={color} />
                        <rect x="2" y="20" width="2" height="2" fill={color} />
                        <rect x="20" y="20" width="2" height="2" fill={color} />
                    </svg>
                );
            case 'wrench':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="16" height="16" fill={color} />
                        <rect x="6" y="6" width="12" height="12" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="8" y="8" width="8" height="8" fill={color} />
                        <rect x="10" y="10" width="4" height="4" fill={isDark ? '#1a1a1a' : '#ffffff'} />
                        <rect x="2" y="2" width="2" height="2" fill={color} />
                        <rect x="20" y="2" width="2" height="2" fill={color} />
                        <rect x="2" y="20" width="2" height="2" fill={color} />
                        <rect x="20" y="20" width="2" height="2" fill={color} />
                        <rect x="2" y="20" width="2" height="2" fill={color} />
                        <rect x="20" y="20" width="2" height="2" fill={color} />
                    </svg>
                );
            case 'seedling':
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="16" width="4" height="6" fill={color} />
                        <rect x="8" y="14" width="2" height="2" fill={color} />
                        <rect x="14" y="14" width="2" height="2" fill={color} />
                        <rect x="6" y="12" width="2" height="2" fill={color} />
                        <rect x="16" y="12" width="2" height="2" fill={color} />
                        <rect x="4" y="10" width="2" height="2" fill={color} />
                        <rect x="18" y="10" width="2" height="2" fill={color} />
                        <rect x="2" y="8" width="2" height="2" fill={color} />
                        <rect x="20" y="8" width="2" height="2" fill={color} />
                        <rect x="12" y="6" width="2" height="2" fill={color} />
                        <rect x="12" y="4" width="2" height="2" fill={color} />
                    </svg>
                );
            default:
                return (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="16" height="16" fill={color} />
                    </svg>
                );
        }
    };

    return (
        <span className={`pixel-icon ${className}`}>
            {getIconPath()}
        </span>
    );
};

export default PixelIcon; 