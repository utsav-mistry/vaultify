const supabase = require('./utils/supabaseClient');
const { sendInactivityEmail, sendPauseEmail } = require('./utils/email');

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
const now = new Date();

async function runInactivityCheck() {
    console.log('Starting inactivity check...');
    const { data: users, error } = await supabase
        .from('user')
        .select('*');
    if (error) {
        console.error('Error fetching users:', error);
        return;
    }
    let warned = 0, paused = 0;
    for (const user of users) {
        if (user.is_paused) continue;
        const lastActive = user.last_active ? new Date(user.last_active) : (user.created_at ? new Date(user.created_at) : null);
        if (!lastActive) continue;
        const inactiveMs = now - lastActive;
        // Pause if inactive >= 30 days
        if (inactiveMs >= THIRTY_DAYS) {
            // Only pause if not already paused
            await supabase.from('user').update({ is_paused: true, pause_reason: 'inactivity', last_inactivity_email_sent: now.toISOString() }).eq('id', user.id);
            await sendPauseEmail(user.email, user.username);
            await supabase.from('logs').insert({ user_id: user.id, action: 'Account paused', details: 'Paused due to 30+ days inactivity', timestamp: now.toISOString() });
            console.log(`Paused user ${user.email}`);
            paused++;
            continue;
        }
        // Warn if inactive >= 7 days and no email sent in last 7 days
        if (inactiveMs >= SEVEN_DAYS) {
            const lastWarned = user.last_inactivity_email_sent ? new Date(user.last_inactivity_email_sent) : null;
            if (!lastWarned || (now - lastWarned) >= SEVEN_DAYS) {
                await sendInactivityEmail(user.email, user.username);
                await supabase.from('user').update({ last_inactivity_email_sent: now.toISOString() }).eq('id', user.id);
                await supabase.from('logs').insert({ user_id: user.id, action: 'Inactivity email sent', details: '7+ days inactivity', timestamp: now.toISOString() });
                console.log(`Warned user ${user.email}`);
                warned++;
            }
        }
    }
    console.log(`Inactivity check complete. Warned: ${warned}, Paused: ${paused}`);
}

runInactivityCheck().catch(e => { console.error('Fatal error in inactivity check:', e); }); 