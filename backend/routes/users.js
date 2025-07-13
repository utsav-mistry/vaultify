const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { authenticateToken, checkDeviceApproval, logAction } = require('../middleware/auth');
const supabase = require('../utils/supabaseClient');
const { verifyPasswordWithFallback, hashPassword } = require('../utils/crypto');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Apply authentication and device approval middleware to all routes
router.use(authenticateToken);
router.use(checkDeviceApproval);
router.use(logAction);

// Get user profile
router.get('/profile', async (req, res) => {
    try {
        // Get user data
        const { data: user, error: userError } = await supabase
            .from('user')
            .select('id, username, email')
            .eq('id', req.user.id)
            .single();

        if (userError) {
            return res.status(500).json({ error: 'Failed to fetch user profile' });
        }

        // Get device count
        const { count: deviceCount, error: deviceError } = await supabase
            .from('device')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', req.user.id);

        if (deviceError) {
            console.error('Device count error:', deviceError);
        }

        // Get password count
        const { count: passwordCount, error: passwordError } = await supabase
            .from('password')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', req.user.id);

        if (passwordError) {
            console.error('Password count error:', passwordError);
        }

        res.json({
            user: {
                ...user,
                deviceCount: deviceCount || 0,
                passwordCount: passwordCount || 0
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update user details
router.put('/profile', [
    body('username').optional().isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('currentPassword').optional().isLength({ min: 1 }).withMessage('Current password is required'),
    body('newPassword').optional().isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, currentPassword, newPassword } = req.body;
        const updateData = {};

        // Check if username or email already exists
        if (username) {
            const { data: existingUser, error: checkError } = await supabase
                .from('user')
                .select('username')
                .eq('username', username)
                .neq('id', req.user.id)
                .single();

            if (existingUser) {
                return res.status(400).json({ error: 'Username already taken' });
            }
            updateData.username = username;
        }

        if (email) {
            const { data: existingUser, error: checkError } = await supabase
                .from('user')
                .select('email')
                .eq('email', email)
                .neq('id', req.user.id)
                .single();

            if (existingUser) {
                return res.status(400).json({ error: 'Email already registered' });
            }
            updateData.email = email;
        }

        // Handle password change
        if (currentPassword && newPassword) {
            // Get current user to verify password
            const { data: currentUser, error: userError } = await supabase
                .from('user')
                .select('password')
                .eq('id', req.user.id)
                .single();

            if (userError) {
                return res.status(500).json({ error: 'Failed to verify current password' });
            }

            // Verify current password with fallback support
            if (!verifyPasswordWithFallback(currentPassword, currentUser.password)) {
                return res.status(400).json({ error: 'Current password is incorrect' });
            }

            // Hash and update password
            updateData.password = hashPassword(newPassword);
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No changes provided' });
        }

        // Update user
        const { data: updatedUser, error: updateError } = await supabase
            .from('user')
            .update(updateData)
            .eq('id', req.user.id)
            .select('id, username, email')
            .single();

        if (updateError) {
            return res.status(500).json({ error: 'Failed to update profile' });
        }

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Upload profile image
router.post('/profile-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Update user with profile image
        const { data: updatedUser, error: updateError } = await supabase
            .from('user')
            .update({
                profile_image: req.file.buffer
            })
            .eq('id', req.user.id)
            .select('id')
            .single();

        if (updateError) {
            return res.status(500).json({ error: 'Failed to upload profile image' });
        }

        res.json({
            message: 'Profile image updated successfully',
            imageUrl: `/api/users/profile-image/${req.user.id}`
        });
    } catch (error) {
        console.error('Upload profile image error:', error);
        res.status(500).json({ error: 'Failed to upload profile image' });
    }
});

// Get profile image
router.get('/profile-image/:userId', async (req, res) => {
    try {
        const { data: user, error: userError } = await supabase
            .from('user')
            .select('profile_image')
            .eq('id', req.params.userId)
            .single();

        if (userError || !user || !user.profile_image) {
            return res.status(404).json({ error: 'Profile image not found' });
        }

        res.set('Content-Type', 'image/jpeg'); // Default to JPEG
        res.send(user.profile_image);
    } catch (error) {
        console.error('Get profile image error:', error);
        res.status(500).json({ error: 'Failed to fetch profile image' });
    }
});

// Remove profile image
router.delete('/profile-image', async (req, res) => {
    try {
        const { error: updateError } = await supabase
            .from('user')
            .update({
                profile_image: null
            })
            .eq('id', req.user.id);

        if (updateError) {
            return res.status(500).json({ error: 'Failed to remove profile image' });
        }

        res.json({ message: 'Profile image removed successfully' });
    } catch (error) {
        console.error('Remove profile image error:', error);
        res.status(500).json({ error: 'Failed to remove profile image' });
    }
});

// Delete user account
router.delete('/account', async (req, res) => {
    try {
        const userId = req.user.id;

        // Delete all passwords
        const { error: passwordError } = await supabase
            .from('password')
            .delete()
            .eq('user_id', userId);

        if (passwordError) {
            console.error('Delete passwords error:', passwordError);
        }

        // Delete all devices
        const { error: deviceError } = await supabase
            .from('device')
            .delete()
            .eq('user_id', userId);

        if (deviceError) {
            console.error('Delete devices error:', deviceError);
        }

        // Delete all logs
        const { error: logError } = await supabase
            .from('logs')
            .delete()
            .eq('user_id', userId);

        if (logError) {
            console.error('Delete logs error:', logError);
        }

        // Delete user
        const { error: userError } = await supabase
            .from('user')
            .delete()
            .eq('id', userId);

        if (userError) {
            return res.status(500).json({ error: 'Failed to delete account' });
        }

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

// Get user activity logs
router.get('/logs', async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        // Get logs with pagination
        const { data: logs, error: logsError, count } = await supabase
            .from('logs')
            .select('*', { count: 'exact' })
            .eq('user_id', req.user.id)
            .order('timestamp', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        if (logsError) {
            return res.status(500).json({ error: 'Failed to fetch logs' });
        }

        const totalLogs = count || 0;
        const totalPages = Math.ceil(totalLogs / parseInt(limit));

        res.json({
            logs: logs || [],
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalLogs,
                hasNext: offset + (logs?.length || 0) < totalLogs,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

module.exports = router; 