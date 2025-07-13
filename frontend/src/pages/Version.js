import React, { useState, useRef, useEffect } from 'react';
import PixelIcon from '../components/PixelIcon';

const versionData = [
    {
        version: '2.0.0',
        date: '2025-07-01',
        title: 'Vaultify 2.0.0 – Full Stack Migration & Pixelated Professional UI',
        current: true,
        icon: 'star',
        details: [
            {
                heading: "Major Architecture Changes",
                items: [
                    'Complete migration from Flask/Jinja to modern MERN stack (React, Node.js, Supabase)',
                    'All core password manager features preserved and enhanced with improved performance',
                    'Full Supabase integration with seamless data merging and preservation of existing user data',
                    'Device management, authentication, import/export, and encryption completely refactored for Supabase',
                    'Zero-knowledge architecture maintained with client-side encryption',
                ],
            },
            {
                heading: "UI/UX Revolution",
                items: [
                    'Minimal, professional, and modern UI with pixelated monochrome icons throughout the application',
                    'Sharp, animated buttons with left-to-right fill hover effects for enhanced interactivity',
                    'Custom pixelated loading animation with pixel blocks and pulse effects for unique user experience',
                    'All error alerts replaced with subtle, theme-synchronized popups that adapt to light/dark mode',
                    'Comprehensive dark mode support with black backgrounds and very light blue accents',
                ],
            },
            {
                heading: "New Features & Pages",
                items: [
                    'Privacy Policy and Terms of Service pages added with comprehensive legal content',
                    'Complete implementation of all application pages with modern React components',
                    'Enhanced device management with approval workflows and detailed device information',
                    'Improved password generation with customizable strength options',
                    'Advanced search functionality with real-time filtering and categorization',
                ],
            },
            {
                heading: "Technical Improvements",
                items: [
                    'Accessibility improvements throughout with proper ARIA labels and keyboard navigation',
                    'Responsive design optimized for all device types and screen sizes',
                    'Enhanced security with improved JWT implementation and session management',
                    'Better error handling with comprehensive user feedback and recovery options',
                    'Performance optimizations with lazy loading and efficient state management',
                ],
            },
        ],
    },
    {
        version: '1.10.2',
        date: '2025-06-01',
        title: 'Vaultify 1.10.2 – Device Management Update',
        icon: 'device',
        details: [
            {
                heading: "Enhanced Security Features",
                items: [
                    'New devices now require explicit approval before accessing user accounts',
                    'Real-time device tracking with IP address monitoring and location detection',
                    'Instant device removal capability with immediate logout enforcement',
                    'Hierarchical device management where only approved devices can manage others',
                    'Detailed device analytics including browser type, operating system, and last activity timestamps',
                ],
            },
            {
                heading: "User Experience Improvements",
                items: [
                    'Clear visual indicators showing which device is currently being used',
                    'Comprehensive device history with activity logs and access patterns',
                    'Simplified approval workflow with one-click device authorization',
                    'Enhanced security notifications for suspicious device activity',
                    'Improved device naming and organization features',
                ],
            },
        ],
    },
    {
        version: '1.10.1',
        date: '2025-05-01',
        title: 'Vaultify 1.10.1 - File Import/Export System',
        icon: 'download',
        details: [
            {
                heading: 'Advanced Import Features',
                items: [
                    'Secure file upload handling with comprehensive validation and sanitization',
                    'Multi-format export support including CSV, XLSX, XLS, JSON, and PDF formats',
                    'Intelligent column mapping interface for seamless spreadsheet imports',
                    'Client-side file validation with type checking and size restrictions',
                    'Batch import processing with progress indicators and error recovery',
                ],
            },
            {
                heading: 'Export Enhancements',
                items: [
                    'Streamlined import flow with step-by-step column selection and preview',
                    'Customizable export filenames with timestamp and format options',
                    'Real-time progress indicators for large file processing operations',
                    'Enhanced error handling with detailed feedback for malformed files',
                    'Template-based export options for common password manager formats',
                ],
            },
        ],
    },
    {
        version: '1.10.0',
        date: '2025-04-01',
        title: 'Vaultify 1.10.0 - Profile Image Update',
        icon: 'user',
        details: [
            {
                heading: 'Profile Personalization',
                items: [
                    'User profile picture upload and management system with secure storage',
                    'Multiple image format support including JPEG, PNG, and WebP',
                    'Automatic image optimization and resizing for optimal performance',
                    'Profile picture cropping and editing tools for perfect customization',
                    'Database storage with efficient compression and retrieval mechanisms',
                ],
            },
        ],
    },
    {
        version: '1.9.0',
        date: '2025-03-01',
        title: 'Vaultify 1.9.0 - User Info Updates',
        icon: 'edit',
        details: [
            {
                heading: 'Account Management',
                items: [
                    'Comprehensive user account information editing capabilities',
                    'Real-time validation of user input with immediate feedback',
                    'Enhanced personalization options for user preferences and settings',
                    'Flexible account customization with multiple profile fields',
                    'Secure update process with confirmation and rollback capabilities',
                ],
            },
        ],
    },
    {
        version: '1.8.0',
        date: '2025-02-01',
        title: 'Vaultify 1.8.0 - Account Information Display',
        icon: 'info',
        details: [
            {
                heading: 'Information Transparency',
                items: [
                    'Comprehensive user account information display for enhanced transparency',
                    'Detailed account statistics and usage analytics',
                    'Real-time account status and security information',
                    'Accessibility improvements for account information viewing',
                    'Multi-language support for account information display',
                ],
            },
        ],
    },
    {
        version: '1.7.0',
        date: '2025-01-01',
        title: 'Vaultify 1.7.0 - Database Migration to MySQL',
        icon: 'database',
        details: [
            {
                heading: 'Database Upgrade',
                items: [
                    'Complete migration from SQLite to MySQL for improved performance and scalability',
                    'Enhanced data integrity with foreign key constraints and transactions',
                    'Improved query performance with optimized indexing strategies',
                    'Better concurrent user support with connection pooling',
                    'Advanced backup and recovery procedures for data protection',
                ],
            },
        ],
    },
    {
        version: '1.6.2',
        date: '2024-12-01',
        title: 'Vaultify 1.6.2 - Email Configuration for Forgot Password',
        icon: 'mail',
        details: [
            {
                heading: 'Email System Integration',
                items: [
                    'Complete email configuration system for password recovery',
                    'Secure OTP generation and delivery via email',
                    'Email template customization for branded communications',
                    'Rate limiting and spam protection for email services',
                    'Multi-provider email support (SMTP, SendGrid, etc.)',
                ],
            },
        ],
    },
    {
        version: '1.6.0',
        date: '2024-11-01',
        title: 'Vaultify 1.6.0 - Project Kickoff (SEM-3 Start)',
        icon: 'star',
        details: [
            {
                heading: 'The Beginning',
                items: [
                    'Everything started in my SEM-3 around November 2024',
                    'Initial brainstorming and ideation',
                    'Project kickoff and planning initiation',
                ],
            },
        ],
    },
    {
        version: '1.5.0',
        date: '2024-11-15',
        title: 'Vaultify 1.5.0 - Search and Filter',
        icon: 'search',
        details: [
            {
                heading: 'Search Functionality',
                items: [
                    'Real-time search across all password entries',
                    'Advanced filtering by category, tags, and date',
                    'Search history and saved search queries',
                    'Export search results to various formats',
                    'Search suggestions and auto-complete',
                ],
            },
        ],
    },
    {
        version: '1.4.0',
        date: '2024-11-10',
        title: 'Vaultify 1.4.0 - Categories and Tags',
        icon: 'folder',
        details: [
            {
                heading: 'Organization Features',
                items: [
                    'Custom categories and subcategories for passwords',
                    'Tag system for flexible organization',
                    'Bulk operations for multiple password entries',
                    'Category-based statistics and reporting',
                    'Import/export of category structures',
                ],
            },
        ],
    },
    {
        version: '1.3.0',
        date: '2024-11-05',
        title: 'Vaultify 1.3.0 - Encryption Upgrade',
        icon: 'lock',
        details: [
            {
                heading: 'Enhanced Encryption',
                items: [
                    'Upgraded to AES-256 encryption standard',
                    'Improved key derivation and management',
                    'Enhanced secure random number generation',
                    'Additional encryption layers for sensitive data',
                    'Compliance with industry security standards',
                ],
            },
        ],
    },
    {
        version: '1.2.0',
        date: '2024-11-01',
        title: 'Vaultify 1.2.0 - User Interface',
        icon: 'paint-brush',
        details: [
            {
                heading: 'UI Improvements',
                items: [
                    'Modern and responsive user interface design',
                    'Improved navigation and user experience',
                    'Better mobile device compatibility',
                    'Accessibility improvements and keyboard navigation',
                    'Customizable themes and color schemes',
                ],
            },
        ],
    },
    {
        version: '1.1.0',
        date: '2024-10-25',
        title: 'Vaultify 1.1.0 - Core Features',
        icon: 'cog',
        details: [
            {
                heading: 'Core Functionality',
                items: [
                    'Basic password storage and retrieval',
                    'User authentication and registration',
                    'Password encryption and security',
                    'Simple search and filter capabilities',
                    'Basic user profile management',
                ],
            },
        ],
    },
    {
        version: '1.0.0',
        date: '2024-10-20',
        title: 'Vaultify 1.0.0 - Initial Release',
        icon: 'rocket',
        details: [
            {
                heading: 'Foundation',
                items: [
                    'Initial password manager application',
                    'Basic user authentication system',
                    'Simple password storage functionality',
                    'Web-based interface',
                    'SQLite database for data storage',
                ],
            },
        ],
    },
    {
        version: '0.9.0',
        date: '2024-10-15',
        title: 'Vaultify 0.9.0 - Beta Testing',
        icon: 'flask',
        details: [
            {
                heading: 'Beta Features',
                items: [
                    'Initial beta testing phase with core functionality',
                    'User feedback collection and bug fixes',
                    'Performance optimization and stability improvements',
                    'Security testing and vulnerability assessments',
                    'UI/UX refinements based on user testing',
                ],
            },
        ],
    },
    {
        version: '0.8.0',
        date: '2024-10-10',
        title: 'Vaultify 0.8.0 - Alpha Development',
        icon: 'code',
        details: [
            {
                heading: 'Development Phase',
                items: [
                    'Core application architecture development',
                    'Basic password management functionality',
                    'User interface prototyping and design',
                    'Database schema design and implementation',
                    'Security framework and encryption setup',
                ],
            },
        ],
    },
    {
        version: '0.7.0',
        date: '2024-10-05',
        title: 'Vaultify 0.7.0 - Planning & Design',
        icon: 'lightbulb',
        details: [
            {
                heading: 'Project Planning',
                items: [
                    'Project requirements and specifications',
                    'Technology stack selection and evaluation',
                    'Security architecture planning',
                    'User experience design and wireframing',
                    'Development timeline and milestone planning',
                ],
            },
        ],
    },
    {
        version: '0.6.0',
        date: '2024-10-01',
        title: 'Vaultify 0.6.0 - Concept Development',
        icon: 'brain',
        details: [
            {
                heading: 'Initial Concept',
                items: [
                    'Password manager concept development',
                    'Market research and competitive analysis',
                    'Security requirements definition',
                    'Feature prioritization and roadmap planning',
                    'Technical feasibility assessment',
                ],
            },
        ],
    },
    {
        version: '0.5.0',
        date: '2024-09-25',
        title: 'Vaultify 0.5.0 - Research Phase',
        icon: 'microscope',
        details: [
            {
                heading: 'Research & Analysis',
                items: [
                    'Security standards and best practices research',
                    'Password manager market analysis',
                    'User needs and pain points identification',
                    'Technology trends and emerging solutions',
                    'Regulatory compliance requirements study',
                ],
            },
        ],
    },
    {
        version: '0.4.0',
        date: '2024-09-20',
        title: 'Vaultify 0.4.0 - Ideation',
        icon: 'lightbulb',
        details: [
            {
                heading: 'Project Ideation',
                items: [
                    'Initial project brainstorming sessions',
                    'Problem statement definition',
                    'Solution approach conceptualization',
                    'Team formation and role assignment',
                    'Project scope and objectives definition',
                ],
            },
        ],
    },
    {
        version: '0.3.0',
        date: '2024-09-15',
        title: 'Vaultify 0.3.0 - Foundation',
        icon: 'hammer',
        details: [
            {
                heading: 'Foundation Work',
                items: [
                    'Development environment setup',
                    'Version control system implementation',
                    'Project structure and organization',
                    'Basic coding standards and guidelines',
                    'Development workflow establishment',
                ],
            },
        ],
    },
    {
        version: '0.2.0',
        date: '2024-09-10',
        title: 'Vaultify 0.2.0 - Setup',
        icon: 'wrench',
        details: [
            {
                heading: 'Project Setup',
                items: [
                    'Development tools and IDE configuration',
                    'Project repository initialization',
                    'Basic project structure creation',
                    'Development team onboarding',
                    'Initial project documentation',
                ],
            },
        ],
    },
    {
        version: '0.1.0',
        date: '2024-09-05',
        title: 'Vaultify 0.1.0 - Genesis',
        icon: 'seedling',
        details: [
            {
                heading: 'Project Genesis',
                items: [
                    'Initial project concept discussion',
                    'Team formation and collaboration setup',
                    'Project goals and vision definition',
                    'Initial brainstorming and ideation',
                    'Project kickoff and planning initiation',
                ],
            },
        ],
    },
];

const Version = () => {
    const [selected, setSelected] = useState(0);
    const timelineRef = useRef(null);

    const scrollToVersion = (index) => {
        if (timelineRef.current) {
            const container = timelineRef.current;
            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                // Vertical scroll for mobile
                const itemHeight = 80; // Approximate height of each timeline item
                const scrollPosition = index * itemHeight - container.clientHeight / 2 + itemHeight / 2;
                container.scrollTo({
                    top: Math.max(0, scrollPosition),
                    behavior: 'smooth'
                });
            } else {
                // Horizontal scroll for desktop
                const itemWidth = 80; // Approximate width of each timeline item
                const scrollPosition = index * itemWidth - container.clientWidth / 2 + itemWidth / 2;
                container.scrollTo({
                    left: Math.max(0, scrollPosition),
                    behavior: 'smooth'
                });
            }
        }
    };

    useEffect(() => {
        scrollToVersion(selected);
    }, [selected]);

    return (
        <div className="version-page">
            <div className="container">
                <div className="version-header text-center">
                    <h1>Vaultify Version History</h1>
                    <p>Track our journey from Nothing to Everything</p>
                </div>

                {/* Timeline */}
                <div className="timeline-container">
                    <div className="timeline-scroll" ref={timelineRef}>
                        {versionData.map((v, idx) => (
                            <button
                                key={v.version}
                                className={`timeline-item${idx === selected ? ' selected' : ''}${v.current ? ' current' : ''}`}
                                onClick={() => setSelected(idx)}
                            >
                                <div
                                    className="timeline-dot"
                                    style={v.current ? { background: '#FFD700', boxShadow: '0 0 0 2px #FFD700' } : idx === selected ? { background: 'var(--color-primary)', boxShadow: '0 0 0 2px var(--color-primary)' } : {}}
                                >
                                    <div className="timeline-icon">
                                        <PixelIcon type={v.icon} size={v.current ? 20 : idx === selected ? 18 : 16} />
                                    </div>
                                </div>
                                <div className="timeline-line"></div>
                                <div className="timeline-version">
                                    <span className="version-number">{v.version}</span>
                                    {v.current && <span className="current-badge">Current</span>}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Version Details */}
                <div className="version-details">
                    <div className={`version-card${versionData[selected].current ? ' current' : ''}`}>
                        <div className="version-header-details">
                            <div className="version-badge">
                                <div className="version-icon" style={versionData[selected].current ? { background: '#FFD700', boxShadow: '0 0 0 2px #FFD700' } : { background: '#808080', boxShadow: '0 0 0 2px #808080' }}>
                                    <PixelIcon type={versionData[selected].icon} size={versionData[selected].current ? 28 : 20} />
                                </div>
                                <div className="version-info">
                                    <span className="version-number">{versionData[selected].version}</span>
                                    {versionData[selected].current && <span className="version-tag">Current Release</span>}
                                    <span className="version-date">{versionData[selected].date}</span>
                                </div>
                            </div>
                        </div>

                        <h2>{versionData[selected].title}</h2>

                        {versionData[selected].details.map((cat, i) => (
                            <div key={i} className="version-section">
                                {cat.heading && (
                                    <div className="section-header">
                                        <h4>{cat.heading}</h4>
                                    </div>
                                )}
                                <div className="section-content">
                                    <ul>
                                        {cat.items.map((item, j) => (
                                            <li key={j}>
                                                <span className="item-text">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .version-page {
                    padding: 40px 0;
                    min-height: 100vh;
                    background: var(--bg-primary);
                }

                .version-header {
                    margin-bottom: 40px;
                }

                .version-header h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 10px;
                }

                .version-header p {
                    font-size: 1.1rem;
                    color: var(--text-secondary);
                }

                .timeline-container {
                    margin: 40px 0;
                    position: relative;
                }

                .timeline-scroll {
                    display: flex;
                    gap: 0;
                    overflow-x: auto;
                    overflow-y: hidden;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    padding: 20px 0;
                    scroll-behavior: smooth;
                    align-items: center;
                }

                .timeline-scroll::-webkit-scrollbar {
                    display: none;
                }

                .timeline-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    min-width: 80px;
                    padding: 12px 8px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .timeline-dot {
                    width: 40px;
                    height: 40px;
                    background: var(--border-primary);
                    border: 2px solid var(--bg-elevated);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    position: relative;
                    z-index: 2;
                }

                .timeline-item:hover .timeline-dot {
                    background: var(--color-primary);
                    transform: scale(1.1);
                }

                .timeline-item.selected .timeline-dot {
                    background: var(--color-primary);
                    transform: scale(1.1);
                    animation: selectedPulse 2s ease infinite;
                }

                .timeline-item.current .timeline-dot {
                    background: #FFD700;
                    animation: goldenPulse 2s ease infinite;
                }

                @keyframes goldenPulse {
                    0% {
                        box-shadow: 0 0 0 0px rgba(255, 215, 0, 0.4);
                    }
                    50% {
                        box-shadow: 0 0 0 8px rgba(255, 215, 0, 0.2), 0 0 0 16px rgba(255, 215, 0, 0.1);
                    }
                    100% {
                        box-shadow: 0 0 0 16px rgba(255, 215, 0, 0.05), 0 0 0 32px rgba(255, 215, 0, 0.02);
                    }
                }

                @keyframes selectedPulse {
                    0% {
                        box-shadow: 0 0 0 0px rgba(128, 128, 128, 0.4);
                    }
                    50% {
                        box-shadow: 0 0 0 8px rgba(128, 128, 128, 0.2), 0 0 0 16px rgba(128, 128, 128, 0.1);
                    }
                    100% {
                        box-shadow: 0 0 0 16px rgba(128, 128, 128, 0.05), 0 0 0 32px rgba(128, 128, 128, 0.02);
                    }
                }

                .timeline-icon {
                    font-size: 12px;
                }

                .timeline-line {
                    width: 60px;
                    height: 2px;
                    background: var(--border-primary);
                    transition: all 0.3s ease;
                }

                .timeline-item:hover .timeline-line {
                    background: var(--color-primary);
                }

                .timeline-item.selected .timeline-line {
                    background: var(--color-primary);
                }

                .timeline-version {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.3s ease;
                }

                .timeline-item:hover .timeline-version,
                .timeline-item.selected .timeline-version {
                    opacity: 1;
                    transform: translateY(0);
                }

                .version-number {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .current-badge {
                    font-size: 0.6rem;
                    background: #FFD700;
                    color: #000;
                    padding: 2px 6px;
                    border-radius: 10px;
                    font-weight: 500;
                }

                .version-details {
                    margin-top: 40px;
                }

                .version-card {
                    background: var(--bg-elevated);
                    border: 2px solid var(--border-primary);
                    border-radius: var(--radius-none);
                    padding: 30px;
                    box-shadow: var(--shadow-base);
                    transition: all 0.3s ease;
                }

                .version-card.current {
                    border-color: #FFD700;
                    box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.3);
                }

                .version-header-details {
                    margin-bottom: 20px;
                }

                .version-badge {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .version-icon {
                    width: 48px;
                    height: 48px;
                    background: var(--color-primary);
                    border-radius: var(--radius-none);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .version-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .version-info .version-number {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .version-tag {
                    font-size: 0.8rem;
                    background: #FFD700;
                    color: #000;
                    padding: 4px 8px;
                    border-radius: var(--radius-none);
                    font-weight: 500;
                    align-self: flex-start;
                }

                .version-date {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }

                .version-card h2 {
                    font-size: 1.8rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 20px;
                }

                .version-section {
                    margin-bottom: 25px;
                }

                .section-header h4 {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 12px;
                }

                .section-content ul {
                    list-style: none;
                    padding: 0;
                }

                .section-content li {
                    padding: 8px 0;
                    border-bottom: 1px solid var(--border-primary);
                    position: relative;
                    padding-left: 20px;
                }

                .section-content li:before {
                    content: '•';
                    position: absolute;
                    left: 0;
                    color: var(--color-primary);
                    font-weight: bold;
                }

                .item-text {
                    color: var(--text-secondary);
                    line-height: 1.6;
                }

                @media (max-width: 768px) {
                    .version-header h1 {
                        font-size: 2rem;
                    }

                    .timeline-scroll {
                        gap: 0;
                    }

                    .timeline-item {
                        min-width: 60px;
                    }

                    .timeline-dot {
                        width: 36px;
                        height: 36px;
                    }

                    .timeline-line {
                        width: 40px;
                    }

                    .version-card {
                        padding: 20px;
                    }

                    .version-card h2 {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Version;