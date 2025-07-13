const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const supabase = require('../utils/supabaseClient');
const { generateAESKey, generateOTP, verifyPasswordWithFallback, migrateOldPassword, isOldPasswordFormat } = require('../utils/crypto');
const { sendOTPEmail, sendPasswordResetEmail } = require('../utils/email');

const router = express.Router();

// In-memory OTP storage (in production, use Redis)
const otpStore = new Map();

// Register user
router.post('/register', [
    body('username').isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        // Check if user already exists in Supabase
        const { data: existingUsers, error: checkError } = await supabase
            .from('user')
            .select('username, email')
            .or(`username.eq.${username},email.eq.${email}`);

        if (checkError) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (existingUsers && existingUsers.length > 0) {
            const errors = [];
            if (existingUsers.some(u => u.username === username)) {
                errors.push({ field: 'username', message: 'Username already taken' });
            }
            if (existingUsers.some(u => u.email === email)) {
                errors.push({ field: 'email', message: 'Email already registered' });
            }
            return res.status(400).json({ errors });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = Date.now() + (5 * 60 * 1000); // 5 minutes

        // Store OTP temporarily
        otpStore.set(email, {
            otp,
            expiry: otpExpiry,
            userData: { username, email, password }
        });

        // Send OTP email
        const emailSent = await sendOTPEmail(email, otp);
        if (!emailSent) {
            return res.status(500).json({ error: 'Failed to send OTP email' });
        }

        res.json({
            message: 'OTP sent to your email',
            email: email
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Verify OTP and complete registration
router.post('/verify-otp', [
    body('email').isEmail().withMessage('Valid email required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, otp } = req.body;

        // Check if OTP exists and is valid
        const otpData = otpStore.get(email);
        if (!otpData || otpData.otp !== otp || Date.now() > otpData.expiry) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        const { username, password } = otpData.userData;

        // Generate AES key for user
        const aesKey = generateAESKey();

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user in Supabase
        const { data: user, error: userError } = await supabase
            .from('user')
            .insert({
                username,
                email,
                password: passwordHash,
                aes_key: aesKey
            })
            .select()
            .single();

        if (userError) {
            console.error('User creation error:', userError);
            return res.status(500).json({ error: 'Failed to create user' });
        }

        // Create first device (auto-approved)
        const { error: deviceError } = await supabase
            .from('device')
            .insert({
                user_id: user.id,
                device_name: 'Primary Device',
                ip_address: req.ip || req.connection.remoteAddress,
                user_agent: req.headers['user-agent'],
                is_approved: true,
                is_rejected: false
            });

        if (deviceError) {
            // Check if this is a duplicate constraint violation
            if (deviceError.code === '23505') {
                console.log('Primary device already exists for user, continuing with registration');
            } else {
                console.error('Device creation error:', deviceError);
            }
        }

        // Log registration
        await supabase
            .from('logs')
            .insert({
                user_id: user.id,
                action: 'User registered',
                details: `Username: ${username}, Email: ${email}, IP: ${req.ip || req.connection.remoteAddress}, User-Agent: ${req.headers['user-agent']}`,
                timestamp: new Date().toISOString()
            });

        // Clear OTP
        otpStore.delete(email);

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'vaultify-secret-key',
            { expiresIn: '7d' }
        );

        // Return user data without sensitive information
        const safeUser = {
            id: user.id,
            username: user.username,
            email: user.email
        };

        res.json({
            message: 'Registration successful',
            token,
            user: safeUser
        });

    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ error: 'OTP verification failed' });
    }
});

// Login user
router.post('/login', [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user in Supabase
        const { data: user, error: userError } = await supabase
            .from('user')
            .select('*')
            .eq('email', email)
            .single();

        if (userError || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password with fallback support for old SHA-256 format
        let isPasswordValid = false;

        // First try bcrypt (current format)
        try {
            isPasswordValid = await bcrypt.compare(password, user.password);
        } catch (error) {
            console.log('Bcrypt comparison failed, trying fallback:', error.message);
        }

        // If bcrypt fails, try old SHA-256 format
        if (!isPasswordValid) {
            isPasswordValid = verifyPasswordWithFallback(password, user.password);
            if (isPasswordValid) {
                console.log('User logged in with legacy SHA-256 password format');

                // Automatically migrate old password to new format
                try {
                    const newPasswordHash = migrateOldPassword(password);
                    await supabase
                        .from('user')
                        .update({ password: newPasswordHash })
                        .eq('id', user.id);
                    console.log('Successfully migrated user password from SHA-256 to new format');
                } catch (migrationError) {
                    console.error('Failed to migrate password:', migrationError);
                    // Continue with login even if migration fails
                }
            }
        }

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Device handling logic - approve first device, require approval for others
        const userAgent = req.headers['user-agent'];
        const ipAddress = req.ip || req.connection.remoteAddress;

        console.log('Login: Checking device for user:', user.id, 'IP:', ipAddress, 'User-Agent:', userAgent);

        // First, check if this is the user's first device
        const { data: existingDevices, error: devicesError } = await supabase
            .from('device')
            .select('*')
            .eq('user_id', user.id);

        if (devicesError) {
            console.error('Failed to fetch existing devices:', devicesError);
            return res.status(500).json({ error: 'Device verification failed' });
        }

        const isFirstDevice = existingDevices.length === 0;

        // Check if this specific device exists (more robust detection to prevent duplicates)
        let device = null;
        let deviceError = null;

        // First try exact match (user_agent + ip_address)
        const { data: exactDevice, error: exactError } = await supabase
            .from('device')
            .select('*')
            .eq('user_id', user.id)
            .eq('user_agent', userAgent)
            .eq('ip_address', ipAddress)
            .single();

        if (!exactError && exactDevice) {
            device = exactDevice;
            console.log('Login: Found exact device match:', device.id);
        } else {
            // If no exact match, check for similar devices (same user_agent but different IP)
            // This handles cases where IP changes but it's the same device (e.g., mobile network, VPN)
            const { data: similarDevices, error: similarError } = await supabase
                .from('device')
                .select('*')
                .eq('user_id', user.id)
                .eq('user_agent', userAgent)
                .order('created_at', { ascending: false });

            if (!similarError && similarDevices && similarDevices.length > 0) {
                // Found a device with same user_agent, use the most recent one
                device = similarDevices[0];
                console.log('Login: Found similar device (same user_agent):', device.id);

                // Update the IP address to the current one
                await supabase
                    .from('device')
                    .update({ ip_address: ipAddress })
                    .eq('id', device.id);
                console.log('Login: Updated device IP address to:', ipAddress);
            } else {
                deviceError = 'Device not found';
            }
        }

        console.log('Login: Device lookup result:', { device, deviceError, isFirstDevice });

        let currentDevice = device;

        if (deviceError || !device) {
            // This is a new device
            const shouldAutoApprove = isFirstDevice;

            // Try to create new device, but handle potential duplicate constraint violations
            const { data: newDevice, error: newDeviceError } = await supabase
                .from('device')
                .insert({
                    user_id: user.id,
                    device_name: getDeviceName(userAgent),
                    ip_address: ipAddress,
                    user_agent: userAgent,
                    is_approved: shouldAutoApprove ? true : null, // Auto-approve only first device
                    is_rejected: false
                })
                .select()
                .single();

            if (newDeviceError) {
                // Check if this is a duplicate constraint violation
                if (newDeviceError.code === '23505') { // PostgreSQL unique constraint violation
                    console.log('Device already exists, attempting to find existing device');

                    // Try to find the existing device
                    const { data: existingDevice, error: findError } = await supabase
                        .from('device')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('user_agent', userAgent)
                        .single();

                    if (!findError && existingDevice) {
                        // Use the existing device
                        currentDevice = existingDevice;
                        console.log('Login: Using existing device:', existingDevice.id);

                        // Update IP address if it changed
                        if (existingDevice.ip_address !== ipAddress) {
                            await supabase
                                .from('device')
                                .update({ ip_address: ipAddress })
                                .eq('id', existingDevice.id);
                            console.log('Login: Updated device IP address to:', ipAddress);
                        }
                    } else {
                        console.error('Failed to find existing device after constraint violation:', findError);
                        return res.status(500).json({ error: 'Device registration failed' });
                    }
                } else {
                    console.error('Failed to create device record:', newDeviceError);
                    return res.status(500).json({ error: 'Device registration failed' });
                }
            } else {
                currentDevice = newDevice;
                console.log('Login: Created new device:', newDevice.id, 'Auto-approved:', shouldAutoApprove);

                // If this is not the first device, block login and require approval
                if (!shouldAutoApprove) {
                    return res.status(403).json({
                        error: 'New device detected. Please approve this device from another authorized device.',
                        requiresApproval: true,
                        deviceId: newDevice.id
                    });
                }
            }
        } else {
            // Device exists, check if it's approved
            if (device.is_approved === false || device.is_rejected === true) {
                return res.status(403).json({
                    error: 'This device has been rejected. Please use another device or contact support.',
                    deviceRejected: true
                });
            }

            if (device.is_approved === null) {
                return res.status(403).json({
                    error: 'This device is pending approval. Please approve it from another authorized device.',
                    requiresApproval: true,
                    deviceId: device.id
                });
            }

            // Device is approved, proceed with login
            currentDevice = device;
        }

        console.log('Login: Device handling complete, proceeding with login for user:', user.id);

        // Update device last used if device exists
        if (currentDevice) {
            await supabase
                .from('device')
                .update({
                    last_used: new Date().toISOString()
                })
                .eq('id', currentDevice.id);

            // Log login
            await supabase
                .from('logs')
                .insert({
                    user_id: user.id,
                    action: 'User logged in',
                    details: `Device: ${currentDevice.device_name}, IP: ${ipAddress}, User-Agent: ${userAgent}`,
                    timestamp: new Date().toISOString()
                });
        } else {
            // Log login without device info
            await supabase
                .from('logs')
                .insert({
                    user_id: user.id,
                    action: 'User logged in',
                    details: `IP: ${ipAddress}, User-Agent: ${userAgent}`,
                    timestamp: new Date().toISOString()
                });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'vaultify-secret-key',
            { expiresIn: '7d' }
        );

        // Return user data including aes_key
        const safeUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            aes_key: user.aes_key
        };

        console.log('Login: Sending successful response for user:', user.id);
        res.json({
            message: 'Login successful',
            token,
            user: safeUser
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Forgot password
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Valid email required')
], async (req, res) => {
    try {
        console.log('Forgot password request received for email:', req.body.email);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;
        console.log('Looking up user with email:', email);

        const { data: user, error: userError } = await supabase
            .from('user')
            .select('*')
            .eq('email', email)
            .single();

        console.log('User lookup result:', { user, userError });

        if (userError || !user) {
            console.log('User not found or error:', userError);
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = Date.now() + (5 * 60 * 1000); // 5 minutes
        console.log('Generated OTP:', otp, 'for email:', email);

        // Store OTP temporarily
        otpStore.set(email, {
            otp,
            expiry: otpExpiry,
            type: 'password-reset'
        });
        console.log('OTP stored in memory');

        // Send OTP email
        console.log('Attempting to send OTP email to:', email);
        const emailSent = await sendOTPEmail(email, otp);
        console.log('Email send result:', emailSent);

        if (!emailSent) {
            console.log('Failed to send OTP email');
            return res.status(500).json({ error: 'Failed to send OTP email' });
        }

        console.log('OTP email sent successfully');
        res.json({ message: 'Password reset OTP sent' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Password reset failed' });
    }
});

// Reset password
router.post('/reset-password', [
    body('email').isEmail().withMessage('Valid email required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, otp, password } = req.body;

        // Check if OTP exists and is valid
        const otpData = otpStore.get(email);
        if (!otpData || otpData.otp !== otp || Date.now() > otpData.expiry || otpData.type !== 'password-reset') {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        const { data: user, error: userError } = await supabase
            .from('user')
            .select('*')
            .eq('email', email)
            .single();

        if (userError || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        const { error: updateError } = await supabase
            .from('user')
            .update({ password: passwordHash })
            .eq('id', user.id);

        if (updateError) {
            console.error('Password reset update error:', updateError);
            return res.status(500).json({ error: 'Password reset failed' });
        }

        // Log password reset
        await supabase
            .from('logs')
            .insert({
                user_id: user.id,
                action: 'Password reset',
                details: `Password reset via OTP, IP: ${req.ip || req.connection.remoteAddress}, User-Agent: ${req.headers['user-agent']}`,
                timestamp: new Date().toISOString()
            });

        // Clear OTP
        otpStore.delete(email);

        res.json({ message: 'Password reset successful' });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Password reset failed' });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vaultify-secret-key');

        const { data: user, error } = await supabase
            .from('user')
            .select('id, username, email, aes_key')
            .eq('id', decoded.userId)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        res.json({ user });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(500).json({ error: 'Authentication error' });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vaultify-secret-key');

        await supabase
            .from('logs')
            .insert({
                user_id: decoded.userId,
                action: 'User logged out',
                details: `User logged out successfully, IP: ${req.ip || req.connection.remoteAddress}, User-Agent: ${req.headers['user-agent']}`,
                timestamp: new Date().toISOString()
            });

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

// Helper function to get device name from user agent
function getDeviceName(userAgent) {
    if (!userAgent) return 'Unknown Device';

    if (userAgent.includes('Mobile')) {
        if (userAgent.includes('iPhone')) return 'iPhone';
        if (userAgent.includes('Android')) return 'Android Phone';
        return 'Mobile Device';
    }

    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux PC';

    return 'Desktop Device';
}

module.exports = router; 