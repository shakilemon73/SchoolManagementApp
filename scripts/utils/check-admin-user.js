import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function checkAdminUser() {
    console.log('🔍 Checking for admin user emon2001...');
    
    try {
        // Initialize Supabase client
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Query for the emon2001 user
        const { data: users, error } = await supabase
            .from('users')
            .select('id, username, email, name, role, created_at')
            .eq('username', 'emon2001');

        if (error) {
            console.error('❌ Error querying users:', error.message);
            return;
        }

        if (users && users.length > 0) {
            console.log('✓ Found emon2001 admin user:');
            console.log(JSON.stringify(users[0], null, 2));
        } else {
            console.log('❌ emon2001 admin user not found');
            
            // Check all users to see what exists
            const { data: allUsers, error: allError } = await supabase
                .from('users')
                .select('id, username, email, name, role');
                
            if (!allError && allUsers) {
                console.log('\n📋 All users in database:');
                allUsers.forEach(user => {
                    console.log(`- ${user.username} (${user.email}) - Role: ${user.role}`);
                });
            }
        }
    } catch (error) {
        console.error('❌ Connection error:', error.message);
    }
}

checkAdminUser();