import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
    return (
        <div className="policy-page">
            <div className="policy-container">
                <div className="policy-card">
                    <div className="policy-header">
                        <Link to="/" className="back-link">
                            <i className="fas fa-arrow-left"></i>
                            BACK TO HOME
                        </Link>
                        <h1>PRIVACY POLICY</h1>
                        <p>LAST UPDATED: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="policy-content">
                        <div className="policy-section">
                            <h2>1. INFORMATION WE COLLECT</h2>
                            <p>Vaultify collects only the information necessary to provide our password management service:</p>
                            <ul>
                                <li><strong>Account Information:</strong> Email address, username, and encrypted password</li>
                                <li><strong>Profile Data:</strong> Name, profile image, and account preferences</li>
                                <li><strong>Device Information:</strong> Device identifiers, IP addresses, and browser information for security</li>
                                <li><strong>Usage Data:</strong> Login times, device approvals, and security events</li>
                            </ul>
                        </div>

                        <div className="policy-section">
                            <h2>2. HOW WE USE YOUR INFORMATION</h2>
                            <p>We use your information exclusively for:</p>
                            <ul>
                                <li>Providing and maintaining the password management service</li>
                                <li>Securing your account and detecting unauthorized access</li>
                                <li>Managing device approvals and security settings</li>
                                <li>Sending essential service notifications and security alerts</li>
                                <li>Improving our service and user experience</li>
                            </ul>
                        </div>

                        <div className="policy-section">
                            <h2>3. DATA SECURITY</h2>
                            <p>Your security is our top priority:</p>
                            <ul>
                                <li><strong>Zero-Knowledge Architecture:</strong> Your passwords are encrypted on your device and never visible to our servers</li>
                                <li><strong>AES-256 Encryption:</strong> All sensitive data is encrypted using industry-standard encryption</li>
                                <li><strong>Secure Transmission:</strong> All data is transmitted over encrypted HTTPS connections</li>
                                <li><strong>Regular Security Audits:</strong> We conduct regular security assessments and updates</li>
                            </ul>
                        </div>

                        <div className="policy-section">
                            <h2>4. DATA SHARING</h2>
                            <p>We do not sell, trade, or rent your personal information to third parties. We may share information only in these limited circumstances:</p>
                            <ul>
                                <li>With your explicit consent</li>
                                <li>To comply with legal obligations</li>
                                <li>To protect our rights and prevent fraud</li>
                                <li>With trusted service providers who assist in operating our service (under strict confidentiality agreements)</li>
                            </ul>
                        </div>

                        <div className="policy-section">
                            <h2>5. YOUR RIGHTS</h2>
                            <p>You have the right to:</p>
                            <ul>
                                <li>Access and review your personal information</li>
                                <li>Update or correct your account information</li>
                                <li>Delete your account and all associated data</li>
                                <li>Export your password data</li>
                                <li>Opt out of non-essential communications</li>
                            </ul>
                        </div>

                        <div className="policy-section">
                            <h2>6. DATA RETENTION</h2>
                            <p>We retain your information only as long as necessary:</p>
                            <ul>
                                <li>Account data is retained while your account is active</li>
                                <li>Security logs are retained for 90 days for fraud prevention</li>
                                <li>All data is permanently deleted when you delete your account</li>
                            </ul>
                        </div>

                        <div className="policy-section">
                            <h2>7. COOKIES AND TRACKING</h2>
                            <p>We use minimal cookies and tracking:</p>
                            <ul>
                                <li>Essential cookies for authentication and security</li>
                                <li>No third-party tracking or advertising cookies</li>
                                <li>No cross-site tracking or behavioral profiling</li>
                            </ul>
                        </div>

                        <div className="policy-section">
                            <h2>8. CHILDREN'S PRIVACY</h2>
                            <p>Vaultify is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.</p>
                        </div>

                        <div className="policy-section">
                            <h2>9. INTERNATIONAL DATA TRANSFERS</h2>
                            <p>Your data may be processed in countries other than your own. We ensure that all data transfers comply with applicable data protection laws and maintain the same level of security and privacy protection.</p>
                        </div>

                        <div className="policy-section">
                            <h2>10. CHANGES TO THIS POLICY</h2>
                            <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by:</p>
                            <ul>
                                <li>Posting the updated policy on our website</li>
                                <li>Sending an email notification to your registered email address</li>
                                <li>Displaying a notice in the application</li>
                            </ul>
                        </div>

                        <div className="policy-section">
                            <h2>11. CONTACT US</h2>
                            <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
                            <ul>
                                <li>Email: auth@vaultify.com</li>
                                <li>Support: support@vaultify.com</li>
                                <li>Security: auth@vaultify.com</li>
                            </ul>
                        </div>

                        <div className="policy-footer">
                            <Link to="/" className="btn btn-primary">
                                <i className="fas fa-home"></i>
                                RETURN TO HOME
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy; 