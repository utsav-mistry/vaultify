const supabase = require('./utils/supabaseClient');

async function cleanupDuplicateDevices() {
    console.log('Starting duplicate device cleanup...');

    try {
        // Get all devices grouped by user_id and user_agent
        const { data: devices, error } = await supabase
            .from('device')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching devices:', error);
            return;
        }

        // Group devices by user_id and user_agent
        const deviceGroups = {};
        devices.forEach(device => {
            const key = `${device.user_id}-${device.user_agent}`;
            if (!deviceGroups[key]) {
                deviceGroups[key] = [];
            }
            deviceGroups[key].push(device);
        });

        // Find and remove duplicates
        let duplicatesRemoved = 0;
        for (const [key, deviceList] of Object.entries(deviceGroups)) {
            if (deviceList.length > 1) {
                console.log(`Found ${deviceList.length} devices for key: ${key}`);

                // Keep the first (oldest) device, remove the rest
                const devicesToRemove = deviceList.slice(1);

                for (const deviceToRemove of devicesToRemove) {
                    const { error: deleteError } = await supabase
                        .from('device')
                        .delete()
                        .eq('id', deviceToRemove.id);

                    if (deleteError) {
                        console.error(`Error removing duplicate device ${deviceToRemove.id}:`, deleteError);
                    } else {
                        console.log(`Removed duplicate device: ${deviceToRemove.id}`);
                        duplicatesRemoved++;
                    }
                }
            }
        }

        console.log(`Cleanup complete. Removed ${duplicatesRemoved} duplicate devices.`);

    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
    cleanupDuplicateDevices()
        .then(() => {
            console.log('Cleanup script finished');
            process.exit(0);
        })
        .catch(error => {
            console.error('Cleanup script failed:', error);
            process.exit(1);
        });
}

module.exports = { cleanupDuplicateDevices }; 