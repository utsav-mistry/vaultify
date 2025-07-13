const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabaseClient');

// Middleware to verify JWT token and fetch user from Supabase
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vaultify-secret-key');
        // Fetch user from Supabase
        const { data: user, error } = await supabase
            .from('user')
            .select('*')
            .eq('id', decoded.userId)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = user; // user includes aes_key
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(500).json({ error: 'Authentication error' });
    }
};

// Middleware to check device approval
const checkDeviceApproval = async (req, res, next) => {
    try {
        const user = req.user;
        const userAgent = req.headers['user-agent'];
        const ipAddress = req.ip || req.connection.remoteAddress;

        // Use the same robust device detection logic as in auth routes
        let device = null;

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
        } else {
            // If no exact match, check for similar devices (same user_agent but different IP)
            const { data: similarDevices, error: similarError } = await supabase
                .from('device')
                .select('*')
                .eq('user_id', user.id)
                .eq('user_agent', userAgent)
                .order('created_at', { ascending: false });

            if (!similarError && similarDevices && similarDevices.length > 0) {
                device = similarDevices[0];

                // Update the IP address to the current one
                await supabase
                    .from('device')
                    .update({ ip_address: ipAddress })
                    .eq('id', device.id);
            }
        }

        if (!device) {
            // Device not found - this should not happen if user logged in successfully
            // The device should have been created during login
            console.error('Device not found for authenticated user:', user.id);
            return res.status(403).json({ error: 'Device not found. Please log in again.' });
        }

        if (device.is_rejected) {
            return res.status(403).json({ error: 'Device access denied' });
        }

        if (device.is_approved === null) {
            return res.status(403).json({
                error: 'Device approval pending',
                deviceId: device.id,
                deviceName: device.device_name
            });
        }

        // Update last used timestamp
        await supabase
            .from('device')
            .update({
                last_used: new Date().toISOString()
            })
            .eq('id', device.id);

        req.device = device;
        next();
    } catch (error) {
        console.error('Device approval check error:', error);
        return res.status(500).json({ error: 'Device verification error' });
    }
};

// Helper function to get device name from user agent
const getDeviceName = (userAgent) => {
    if (!userAgent) return 'Unknown Device';

    if (userAgent.includes('(') && userAgent.includes(')')) {
        const match = userAgent.match(/\(([^)]+)\)/);
        return match ? match[1] : 'Unknown Device';
    }

    return 'Unknown Device';
};

// Middleware to log user actions
const logAction = async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
        // Log the action after response is sent
        setTimeout(async () => {
            try {
                if (req.user) {
                    await supabase
                        .from('logs')
                        .insert({
                            user_id: req.user.id,
                            action: `${req.method} ${req.path}`,
                            details: JSON.stringify({
                                body: req.body,
                                query: req.query,
                                statusCode: res.statusCode
                            }),
                            timestamp: new Date().toISOString()
                        });
                }
            } catch (error) {
                console.error('Error logging action:', error);
            }
        }, 0);

        originalSend.call(this, data);
    };

    next();
};

module.exports = {
    authenticateToken,
    checkDeviceApproval,
    logAction
}; 