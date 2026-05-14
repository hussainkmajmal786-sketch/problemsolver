import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function migrate() {
  console.log('🔄 Running admin migration...\n');

  // Step 1: The is_admin column must be added via SQL Editor first
  // ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
  
  // Step 2: Set the admin user
  const adminEmail = 'hussainkmajmal786@gmail.com';
  
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('id, name, email, is_admin')
    .eq('email', adminEmail)
    .single();

  if (fetchError) {
    console.log(`⚠️  User "${adminEmail}" not found in profiles table.`);
    console.log('   They need to register first, then run this script again.');
    console.log('   Error:', fetchError.message);
    
    // Let's try to add the column anyway
    console.log('\n📦 Attempting to add is_admin column via update...');
    const { data: allUsers } = await supabase.from('profiles').select('id, email, is_admin').limit(5);
    if (allUsers) {
      console.log('   Column check - sample users:', allUsers.map(u => ({ email: u.email, is_admin: u.is_admin })));
      if (allUsers[0] && allUsers[0].is_admin === undefined) {
        console.log('\n❌ The is_admin column does not exist yet!');
        console.log('   Please run this SQL in your Supabase SQL Editor:\n');
        console.log('   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;');
      }
    }
    process.exit(1);
  }

  console.log(`✅ Found user: ${profile.name} (${profile.email})`);
  console.log(`   Current admin status: ${profile.is_admin}`);

  if (profile.is_admin) {
    console.log('\n🛡️  User is already an admin. No changes needed.');
    process.exit(0);
  }

  // Set as admin
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ is_admin: true })
    .eq('id', profile.id);

  if (updateError) {
    console.error('❌ Failed to set admin:', updateError.message);
    
    if (updateError.message.includes('is_admin')) {
      console.log('\n📦 The is_admin column does not exist yet!');
      console.log('   Please run this SQL in your Supabase SQL Editor:\n');
      console.log('   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;\n');
      console.log('   Then re-run this script: node server/utils/migrateAdmin.js');
    }
    process.exit(1);
  }

  console.log('\n🛡️  Successfully set as ADMIN!');
  console.log('   User can now access /admin on the platform.');
}

migrate();
