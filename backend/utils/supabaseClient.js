const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-supabase-service-key';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase; 