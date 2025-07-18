const express = require('express');
const supabase = require('../utils/supabaseClient');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Approve device
router.post('/:id/approve', authenticateToken, async (req, res) => {
    const deviceId = req.params.id;
    const userId = req.user.id;
    try {
        // First check if device exists and belongs to user
        const { data: existingDevice, error: fetchError } = await supabase
            .from('device')
            .select('*')
            .eq('id', deviceId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !existingDevice) {
            return res.status(404).json({ error: 'Device not found or not authorized' });
        }

        // Update device to approved
        const { data, error } = await supabase
            .from('device')
            .update({
                is_approved: true,
                is_rejected: false
            })
            .eq('id', deviceId)
            .eq('user_id', userId)
            .select();

        if (error) {
            return res.status(500).json({ error: 'Failed to approve device' });
        }

        res.json({
            message: 'Device approved successfully',
            device: data[0]
        });
    } catch (err) {
        console.error('Approve device error:', err);
        res.status(500).json({ error: 'Failed to approve device' });
    }
});

// Reject device
router.post('/:id/reject', authenticateToken, async (req, res) => {
    const deviceId = req.params.id;
    const userId = req.user.id;
    try {
        // First check if device exists and belongs to user
        const { data: existingDevice, error: fetchError } = await supabase
            .from('device')
            .select('*')
            .eq('id', deviceId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !existingDevice) {
            return res.status(404).json({ error: 'Device not found or not authorized' });
        }

        // Update device to rejected
        const { data, error } = await supabase
            .from('device')
            .update({
                is_approved: false,
                is_rejected: true
            })
            .eq('id', deviceId)
            .eq('user_id', userId)
            .select();

        if (error) {
            return res.status(500).json({ error: 'Failed to reject device' });
        }

        res.json({
            message: 'Device rejected successfully',
            device: data[0]
        });
    } catch (err) {
        console.error('Reject device error:', err);
        res.status(500).json({ error: 'Failed to reject device' });
    }
});

// Remove device (hard delete since no soft delete column exists)
router.delete('/:id', authenticateToken, async (req, res) => {
    const deviceId = req.params.id;
    const userId = req.user.id;
    try {
        // First check if device exists and belongs to user
        const { data: existingDevice, error: fetchError } = await supabase
            .from('device')
            .select('*')
            .eq('id', deviceId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !existingDevice) {
            return res.status(404).json({ error: 'Device not found or not authorized' });
        }

        // Hard delete the device
        const { data, error } = await supabase
            .from('device')
            .delete()
            .eq('id', deviceId)
            .eq('user_id', userId)
            .select();

        if (error) {
            return res.status(500).json({ error: 'Failed to remove device' });
        }

        res.json({
            message: 'Device removed successfully',
            device: data[0]
        });
    } catch (err) {
        console.error('Remove device error:', err);
        res.status(500).json({ error: 'Failed to remove device' });
    }
});

// List all devices for user
router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const { data, error } = await supabase
            .from('device')
            .select('*')
            .eq('user_id', userId)
            .order('id', { ascending: false });

        if (error) {
            console.error('Fetch devices error:', error);
            return res.status(500).json({ error: 'Failed to fetch devices' });
        }

        res.json({ devices: data || [] });
    } catch (err) {
        console.error('List devices error:', err);
        res.status(500).json({ error: 'Failed to fetch devices' });
    }
});

// Get pending devices for approval
router.get('/pending', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const { data, error } = await supabase
            .from('device')
            .select('*')
            .eq('user_id', userId)
            .or('is_approved.is.null,is_approved.eq.false')
            .or('is_rejected.is.null,is_rejected.eq.false')
            .order('id', { ascending: false });

        if (error) {
            console.error('Fetch pending devices error:', error);
            return res.status(500).json({ error: 'Failed to fetch pending devices' });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'No pending devices found', devices: [] });
        }

        res.json({ devices: data });
    } catch (err) {
        console.error('Get pending devices error:', err);
        res.status(500).json({ error: 'Failed to fetch pending devices' });
    }
});

// Securely get the status of the current device by device_uid
router.get('/status', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const deviceUid = req.query.device_uid;
    if (!deviceUid) {
        return res.status(400).json({ error: 'Missing device_uid' });
    }
    try {
        const { data: device, error } = await supabase
            .from('device')
            .select('*')
            .eq('user_id', userId)
            .eq('device_uid', deviceUid)
            .single();
        if (error || !device) {
            return res.status(404).json({ error: 'Device not found' });
        }
        res.json({ device });
    } catch (err) {
        console.error('Get device status error:', err);
        res.status(500).json({ error: 'Failed to get device status' });
    }
});

// Get device statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        // Get all devices for user
        const { data: devices, error } = await supabase
            .from('device')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch device statistics' });
        }

        const totalDevices = devices.length;
        const approvedDevices = devices.filter(d => d.is_approved === true).length;
        const pendingDevices = devices.filter(d => d.is_approved === null).length;
        const rejectedDevices = devices.filter(d => d.is_rejected === true).length;

        // Get recent devices (last 7 days) - using last_used instead of created_at
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentDevices = devices.filter(d =>
            d.last_used && new Date(d.last_used) >= sevenDaysAgo
        ).length;

        res.json({
            totalDevices,
            approvedDevices,
            pendingDevices,
            rejectedDevices,
            recentDevices
        });
    } catch (err) {
        console.error('Device stats error:', err);
        res.status(500).json({ error: 'Failed to get device statistics' });
    }
});

module.exports = router; 