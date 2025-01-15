const supabase = require('../config/supabase');

const User = {
    findAdmin: async function({ where }) {
        const { data, error } = await supabase
            .from('admin')
            .select('*')
            .match(where)
            .single();
            
        if (error) throw error;
        return data;
    },

    findAll: async function() {
        const { data, error } = await supabase
            .from('register')
            .select('*');
            
        if (error) throw error;
        return data;
    }
};

module.exports = User;
