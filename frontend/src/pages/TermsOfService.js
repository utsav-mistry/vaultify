import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
    return (
        <div className="policy-page">
            <div className="policy-container">
                <div className="policy-card">
                    <div className="policy-header">
                        <Link to="/" className="back-link">
                            <i className="fas fa-arrow-left"></i>
                            BACK TO HOME
                        </Link>
                        <h1>TERMS OF SERVICE</h1>
                        <p>LAST UPDATED: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="policy-content">
                        <div className="policy-section">
                            <h2>1. ACCEPTANCE OF TERMS</h2>
                            <p>By accessing and using Vaultify ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
                        </div>

                        <div className="policy-section">
                            <h2>2. DESCRIPTION OF SERVICE</h2>
                            <p>Vaultify is a password management service that allows users to:</p>
                            <ul>
                                <li>Store and manage passwords securely</li>
                                <li>Generate strong passwords</li>
                                <li>Organize passwords with categories and tags</li>
                                <li>Import and export password data</li>
                                <li>Manage multiple devices and sessions</li>
                                <li>Access passwords across different devices</li>
                            </ul>
                        </div>

                        <div className="policy-section">
                            <h2>3. USER ACCOUNTS</h2>
                            <p>To use the Service, you must:</p>
                            <ul>
                                <li>Be at least 13 years old</li>
                                <li>Register for an account with valid information</li>
                                <li>Maintain the security of your account credentials</li>
                                <li>Notify us immediately of any unauthorized use</li>
                                <li>Accept responsibility for all activities under your account</li>
                            </ul>
                        </div>

                        <div className="policy-section">
                            <h2>4. ACCEPTABLE USE</h2>
                            <p>You agree not to use the Service to:</p>
                            <ul>
                                <li>Store illegal or unauthorized content</li>
                                <li>Violate any applicable laws or regulations</li>
                                <li>Infringe on intellectual property rights</li>
                                <li>Attempt to gain unauthorized access to our systems</li>
                                <li>Interfere with the Service's operation</li>
                                <li>Share your account with others</li>
                                <li>Use automated tools to access the Service</li>
                            </ul>
                        </div>

                        <div className="policy-section">
                            <h2>5. SECURITY AND PRIVACY</h2>
                            <p>We are committed to protecting your security and privacy:</p>
                            <ul>
                                <li>All passwords are encrypted using AES-256 encryption</li>
                                <li>We implement zero-knowledge architecture</li>
                                <li>We do not have access to your master password</li>
                                <li>We use secure transmission protocols (HTTPS)</li>
                                <li>We conduct regular security audits</li>
                            </ul>
                        </div>

                        <div className="policy-section">
                            <h2>6. SERVICE AVAILABILITY</h2>
                            <p>We strive to maintain high service availability but cannot guarantee:</p>
                            <ul>
                                <li>Uninterrupted access to the Service</li>
                                <li>Error-free operation</li>
                                <li>Compatibility with all devices or browsers</li>
                                <li>Immediate resolution of technical issues</li>
                            </ul>
                        </div>

                        <div className="policy-section">
                            <h2>7. DATA BACKUP AND RECOVERY</h2>
                            <p>While we implement robust backup systems:</p>
                            <ul>
                                <li>You are responsible for backing up your data</li>
                                <li>We recommend regular exports of your password data</li>
                                <li>We cannot guarantee data recovery in all circumstances</li>
                                <li>We are not liable for data loss due to technical issues</li>
                            </ul>
                        </div>

                        <div className="policy-section">
                            <h2>8. INTELLECTUAL PROPERTY</h2>
                            <p>All content and materials available on the Service, including but not limited to text, graphics, website name, code, images, and logos are the intellectual property of Vaultify. These materials are protected by applicable copyright and trademark law.</p>
                        </div>

                        <div className="policy-section">
                            <h2>9. LIMITATION OF LIABILITY</h2>
                            <p>In no event shall Vaultify be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:</p>
                            <ul>
                                <li>Your use or inability to use the Service</li>
                                <li>Any unauthorized access to or use of our servers</li>
                                <li>Any interruption or cessation of transmission to or from the Service</li>
                                <li>Any bugs, viruses, or other harmful code</li>
                                <li>Any errors or omissions in any content</li>
                            </ul>
                        </div>

                        <div className="policy-section">
                            <h2>10. TERMINATION</h2>
                            <p>We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties. Upon termination:</p>
                            <ul>
                                <li>Your right to use the Service will cease immediately</li>
                                <li>We will delete your account and all associated data</li>
                                <li>You will lose access to all stored passwords</li>
                            </ul>
                        </div>

                        <div className="policy-section">
                            <h2>11. CHANGES TO TERMS</h2>
                            <p>We reserve the right to modify these terms at any time. We will notify users of any material changes by:</p>
                            <ul>
                                <li>Posting the updated terms on our website</li>
                                <li>Sending email notifications to registered users</li>
                                <li>Displaying notices within the application</li>
                            </ul>
                            <p>Continued use of the Service after changes constitutes acceptance of the new terms.</p>
                        </div>

                        <div className="policy-section">
                            <h2>12. GOVERNING LAW</h2>
                            <p>These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which Vaultify operates, without regard to its conflict of law provisions.</p>
                        </div>

                        <div className="policy-section">
                            <h2>13. CONTACT INFORMATION</h2>
                            <p>If you have any questions about these Terms of Service, please contact us:</p>
                            <ul>
                                <li>Email: legal@vaultify.com</li>
                                <li>Support: support@vaultify.com</li>
                                <li>General: info@vaultify.com</li>
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

export default TermsOfService; 