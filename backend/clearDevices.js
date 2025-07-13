const supabase = require('./utils/supabaseClient');

async function clearDevices() {
    try {
        console.log('Clearing device table...');

        const { data, error } = await supabase
            .from('device')
            .delete()
            .neq('id', 0); // Delete all records

        if (error) {
            console.error('Error clearing devices:', error);
            return;
        }

        console.log('Device table cleared successfully!');
        console.log('Deleted records:', data);

    } catch (error) {
        console.error('Failed to clear devices:', error);
    }
}

clearDevices(); 