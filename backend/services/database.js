const supabase = require('../utils/supabaseClient');

class DatabaseService {
    // Password operations
    static async getPasswords(userId, search = null) {
        try {
            let query = supabase
                .from('password')
                .select('*')
                .eq('user_id', userId)
                .order('date_created', { ascending: false });

            if (search) {
                query = query.ilike('website', `%${search}%`);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Database getPasswords error:', error);
            throw error;
        }
    }

    static async getPasswordById(id, userId) {
        try {
            const { data, error } = await supabase
                .from('password')
                .select('*')
                .eq('id', id)
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Database getPasswordById error:', error);
            throw error;
        }
    }

    static async createPassword(passwordData) {
        try {
            const { data, error } = await supabase
                .from('password')
                .insert([passwordData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Database createPassword error:', error);
            throw error;
        }
    }

    static async updatePassword(id, userId, updateData) {
        try {
            const { data, error } = await supabase
                .from('password')
                .update(updateData)
                .eq('id', id)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Database updatePassword error:', error);
            throw error;
        }
    }

    static async deletePassword(id, userId) {
        try {
            const { error } = await supabase
                .from('password')
                .delete()
                .eq('id', id)
                .eq('user_id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Database deletePassword error:', error);
            throw error;
        }
    }

    static async searchPasswords(userId, query) {
        try {
            const { data, error } = await supabase
                .from('password')
                .select('*')
                .eq('user_id', userId)
                .ilike('website', `%${query}%`)
                .order('date_created', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Database searchPasswords error:', error);
            throw error;
        }
    }

    // User operations
    static async getUserById(id) {
        try {
            const { data, error } = await supabase
                .from('user')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Database getUserById error:', error);
            throw error;
        }
    }

    static async getUserByEmail(email) {
        try {
            const { data, error } = await supabase
                .from('user')
                .select('*')
                .eq('email', email)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Database getUserByEmail error:', error);
            throw error;
        }
    }

    static async createUser(userData) {
        try {
            const { data, error } = await supabase
                .from('user')
                .insert([userData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Database createUser error:', error);
            throw error;
        }
    }

    static async updateUser(id, updateData) {
        try {
            const { data, error } = await supabase
                .from('user')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Database updateUser error:', error);
            throw error;
        }
    }

    static async deleteUser(id) {
        try {
            const { error } = await supabase
                .from('user')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Database deleteUser error:', error);
            throw error;
        }
    }

    // Device operations
    static async getDevices(userId) {
        try {
            const { data, error } = await supabase
                .from('device')
                .select('*')
                .eq('user_id', userId)
                .order('id', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Database getDevices error:', error);
            throw error;
        }
    }

    static async getDeviceById(id, userId) {
        try {
            const { data, error } = await supabase
                .from('device')
                .select('*')
                .eq('id', id)
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Database getDeviceById error:', error);
            throw error;
        }
    }

    static async createDevice(deviceData) {
        try {
            const { data, error } = await supabase
                .from('device')
                .insert([deviceData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Database createDevice error:', error);
            throw error;
        }
    }

    static async updateDevice(id, userId, updateData) {
        try {
            const { data, error } = await supabase
                .from('device')
                .update(updateData)
                .eq('id', id)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Database updateDevice error:', error);
            throw error;
        }
    }

    static async deleteDevice(id, userId) {
        try {
            const { error } = await supabase
                .from('device')
                .delete()
                .eq('id', id)
                .eq('user_id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Database deleteDevice error:', error);
            throw error;
        }
    }

    // Log operations
    static async createLog(logData) {
        try {
            const { data, error } = await supabase
                .from('logs')
                .insert([logData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Database createLog error:', error);
            throw error;
        }
    }

    static async getLogs(userId, limit = 50) {
        try {
            const { data, error } = await supabase
                .from('logs')
                .select('*')
                .eq('user_id', userId)
                .order('timestamp', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Database getLogs error:', error);
            throw error;
        }
    }
}

module.exports = DatabaseService; 