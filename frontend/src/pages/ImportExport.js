import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../contexts/MessageContext';
import { useTheme } from '../contexts/ThemeContext';
import PixelIcon from '../components/PixelIcon';
import Sidebar from '../components/Sidebar';

import axios from 'axios';

// Configure axios base URL if not already set
if (!axios.defaults.baseURL) {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://vaultify-a88w.onrender.com';
    axios.defaults.baseURL = API_BASE_URL;
}

const ImportExport = () => {
    const { user } = useAuth();
    const { showMessage } = useMessage();
    const { theme } = useTheme();

    const [exportLoading, setExportLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [importFormat, setImportFormat] = useState('csv');
    const [exportFormat, setExportFormat] = useState('csv');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarAreaHovered, setSidebarAreaHovered] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    const deviceUid = localStorage.getItem('device_uid');
    const { getDeviceUidHeader } = useAuth();


    useEffect(() => {
        if (sidebarAreaHovered) setSidebarOpen(true);
        else setSidebarOpen(false);
    }, [sidebarAreaHovered]);

    const handleSidebarEnter = () => setSidebarAreaHovered(true);
    const handleSidebarLeave = () => setSidebarAreaHovered(false);

    const handleExport = async (format) => {
        setExportLoading(true);
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://vaultify-a88w.onrender.com';
            const headers = {
                ...getDeviceUidHeader(),
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            };
            console.log('[Device] Sending x-device-uid header:', headers['x-device-uid']);
            const response = await fetch(`${API_BASE_URL}/api/import-export/export/${format}`, {
                headers
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `vaultify-passwords.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                showMessage(`Passwords exported as ${format.toUpperCase()} successfully`, 'success');
                setFetchError(null);
            } else {
                setFetchError('Failed to export passwords. Please try again later.');
            }
        } catch (error) {
            setFetchError('Failed to export passwords. Please check your connection or try again later.');
        } finally {
            setExportLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleImport = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            showMessage('Please select a file to import', 'error');
            return;
        }

        setImportLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://vaultify-a88w.onrender.com';
            const headers = {
                ...getDeviceUidHeader(),
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            };
            console.log('[Device] Sending x-device-uid header:', headers['x-device-uid']);
            const response = await fetch(`${API_BASE_URL}/api/import-export/import/${importFormat}`, {
                method: 'POST',
                headers,
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                showMessage(`Successfully imported ${data.importedCount} passwords`, 'success');
                setSelectedFile(null);
                // Reset file input
                e.target.reset();
                setFetchError(null);
            } else {
                const errorData = await response.json();
                setFetchError(errorData.message || 'Failed to import passwords. Please try again later.');
            }
        } catch (error) {
            setFetchError(error.message || 'Failed to import passwords. Please check your connection or try again later.');
        } finally {
            setImportLoading(false);
        }
    };

    if (fetchError) {
        return (
            <div className="import-export-page">
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
                    <div className="import-export-header">
                        <h1>Import & Export</h1>
                        <p>Backup your passwords or import from other password managers</p>
                    </div>
                    <div className="empty-state">
                        <PixelIcon name="alert" />
                        <h3>Error</h3>
                        <p>{fetchError}</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="import-export-page">
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
                <div className="import-export-header">
                    <h1>Import & Export</h1>
                    <p>Backup your passwords or import from other password managers</p>
                </div>

                <div className="import-export-actions">
                    <div className="action-section">
                        <h2>Export Passwords</h2>
                        <p>Download your passwords in various formats for backup or migration.</p>
                        <div className="action-controls">
                            <select
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value)}
                                className="form-select"
                            >
                                <option value="csv">CSV - Spreadsheet compatible</option>
                                <option value="excel">Excel - Native Excel format</option>
                                <option value="json">JSON - Developer friendly</option>
                                <option value="pdf">PDF - Print & share ready</option>
                            </select>
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={() => handleExport(exportFormat)}
                                disabled={exportLoading}
                            >
                                {exportLoading ? (
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
                                    <span>EXPORT PASSWORDS</span>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="action-section">
                        <h2>Import Passwords</h2>
                        <p>Import passwords from other password managers or backup files.</p>
                        <form onSubmit={handleImport} className="import-form">
                            <div className="action-controls">
                                <select
                                    value={importFormat}
                                    onChange={(e) => setImportFormat(e.target.value)}
                                    className="form-select"
                                >
                                    <option value="csv">CSV - Spreadsheet format</option>
                                    <option value="excel">Excel - Microsoft Excel files</option>
                                    <option value="json">JSON - Structured data format</option>
                                </select>
                                <input
                                    type="file"
                                    onChange={handleFileSelect}
                                    accept={
                                        importFormat === 'csv' ? '.csv' :
                                            importFormat === 'excel' ? '.xlsx,.xls' :
                                                '.json'
                                    }
                                    className="form-input"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                    disabled={importLoading || !selectedFile}
                                >
                                    {importLoading ? (
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
                                        <span>IMPORT PASSWORDS</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ImportExport; 