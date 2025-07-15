const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, checkDeviceApproval, logAction } = require('../middleware/auth');
const { aesEncrypt, aesDecrypt } = require('../utils/crypto');
const DatabaseService = require('../services/database');
const supabase = require('../utils/supabaseClient');

const router = express.Router();

// Apply authentication and device approval middleware to all routes
router.use(authenticateToken);
router.use(logAction);

// Test endpoint without device approval
router.get('/test-no-device', authenticateToken, async (req, res) => {
    try {
        res.json({
            message: 'Authentication working without device approval',
            user: {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email
            }
        });
    } catch (error) {
        console.error('Test no device error:', error);
        res.status(500).json({ error: 'Test failed' });
    }
});

// Test endpoint to check user devices
router.get('/test-devices', authenticateToken, async (req, res) => {
    try {
        const { data: devices, error } = await supabase
            .from('device')
            .select('*')
            .eq('user_id', req.user.id);

        res.json({
            message: 'User devices',
            user: {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email
            },
            devices: devices || [],
            deviceCount: devices ? devices.length : 0,
            currentUserAgent: req.headers['user-agent'],
            currentIP: req.ip || req.connection.remoteAddress
        });
    } catch (error) {
        console.error('Test devices error:', error);
        res.status(500).json({ error: 'Test failed' });
    }
});

// Apply device approval middleware to all other routes
router.use(checkDeviceApproval);

// Get all passwords for user
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        const passwords = await DatabaseService.getPasswords(req.user.id, search);

        // Decrypt passwords
        const decryptedPasswords = passwords.map(password => {
            const decryptedPassword = aesDecrypt(req.user.aes_key, password.encrypted_password);
            return {
                id: password.id,
                website: password.website,
                username: password.username,
                password: decryptedPassword,
                date_created: password.date_created
            };
        });

        res.json({ passwords: decryptedPasswords });
    } catch (error) {
        console.error('Get passwords error:', error);
        res.status(500).json({ error: 'Failed to fetch passwords' });
    }
});

// Get single password
router.get('/:id', async (req, res) => {
    try {
        const password = await DatabaseService.getPasswordById(req.params.id, req.user.id);

        if (!password) {
            return res.status(404).json({ error: 'Password not found' });
        }

        const decryptedPassword = aesDecrypt(req.user.aes_key, password.encrypted_password);

        res.json({
            id: password.id,
            website: password.website,
            username: password.username,
            password: decryptedPassword,
            date_created: password.date_created
        });
    } catch (error) {
        console.error('Get password error:', error);
        res.status(500).json({ error: 'Failed to fetch password' });
    }
});

// Create new password
router.post('/', [
    body('website').notEmpty().withMessage('Website is required'),
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { website, username, password } = req.body;

        // Encrypt password
        const encryptedPassword = aesEncrypt(req.user.aes_key, password);

        // Create password entry
        const passwordData = {
            website,
            username,
            encrypted_password: encryptedPassword,
            user_id: req.user.id
        };

        const passwordEntry = await DatabaseService.createPassword(passwordData);

        res.status(201).json({
            message: 'Password saved successfully',
            password: {
                _id: passwordEntry.id,
                id: passwordEntry.id,
                website: passwordEntry.website,
                username: passwordEntry.username,
                password: password,
                date_created: passwordEntry.date_created
            }
        });
    } catch (error) {
        console.error('Create password error:', error);
        res.status(500).json({ error: 'Failed to save password' });
    }
});

// Update password
router.put('/:id', [
    body('website').notEmpty().withMessage('Website is required'),
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { website, username, password } = req.body;

        // Find password and verify ownership
        const passwordEntry = await DatabaseService.getPasswordById(req.params.id, req.user.id);

        if (!passwordEntry) {
            return res.status(404).json({ error: 'Password not found' });
        }

        // Encrypt new password
        const encryptedPassword = aesEncrypt(req.user.aes_key, password);

        // Update password entry
        const updateData = {
            website,
            username,
            encrypted_password: encryptedPassword
        };

        const updatedPassword = await DatabaseService.updatePassword(req.params.id, req.user.id, updateData);

        res.json({
            message: 'Password updated successfully',
            password: {
                _id: updatedPassword.id,
                id: updatedPassword.id,
                website: updatedPassword.website,
                username: updatedPassword.username,
                password: password, // Return decrypted password for immediate use
                date_created: updatedPassword.date_created
            }
        });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
});

// Delete password
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await DatabaseService.deletePassword(req.params.id, req.user.id);

        if (!deleted) {
            return res.status(404).json({ error: 'Password not found' });
        }

        res.json({ message: 'Password deleted successfully' });
    } catch (error) {
        console.error('Delete password error:', error);
        res.status(500).json({ error: 'Failed to delete password' });
    }
});

// Search passwords
router.get('/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const passwords = await DatabaseService.searchPasswords(req.user.id, query);

        // Decrypt passwords
        const decryptedPasswords = passwords.map(password => {
            const decryptedPassword = aesDecrypt(req.user.aes_key, password.encrypted_password);
            return {
                _id: password.id,
                id: password.id,
                website: password.website,
                username: password.username,
                password: decryptedPassword,
                date_created: password.date_created
            };
        });

        res.json({ passwords: decryptedPasswords });
    } catch (error) {
        console.error('Search passwords error:', error);
        res.status(500).json({ error: 'Failed to search passwords' });
    }
});

// Test endpoint to check device approval
router.get('/test-device', async (req, res) => {
    try {
        res.json({
            message: 'Device approval working',
            user: {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email
            },
            device: req.device ? {
                id: req.device.id,
                device_name: req.device.device_name,
                is_approved: req.device.is_approved
            } : null
        });
    } catch (error) {
        console.error('Test device error:', error);
        res.status(500).json({ error: 'Test failed' });
    }
});

// Get password statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const passwords = await DatabaseService.getPasswords(req.user.id);

        // Calculate statistics
        const totalPasswords = passwords.length;
        const uniqueWebsites = new Set(passwords.map(p => p.website)).size;

        // Get recent passwords (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentPasswords = passwords.filter(p =>
            new Date(p.date_created) >= sevenDaysAgo
        ).length;

        const stats = {
            totalPasswords,
            uniqueWebsites,
            recentPasswords
        };

        res.json(stats);
    } catch (error) {
        console.error('Get password stats error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: 'Failed to fetch password statistics' });
    }
});

module.exports = router; 