import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ADMIN_EMAIL = 'hussainkmajmal890@gmail.com';
const ADMIN_PASSWORD = 'Ajmal@890';
const ADMIN_NAME = 'Ajmal Hussain';

async function setupAdmin() {
  console.log('🔧 Setting up new admin account...\n');

  // Step 1: Check if user exists in Supabase Auth
  console.log('── Step 1: Checking if user exists in Auth ──');
  const { data: authUsers, error: authErr } = await supabase.auth.admin.listUsers();
  
  if (authErr) {
    console.error('❌ Failed to list auth users:', authErr.message);
    process.exit(1);
  }

  let authUser = authUsers.users.find(u => u.email === ADMIN_EMAIL);
  
  if (authUser) {
    console.log(`   ✅ Auth user already exists: ${authUser.email} (id: ${authUser.id})`);
    
    // Update password
    console.log('   🔑 Updating password...');
    const { error: pwErr } = await supabase.auth.admin.updateUserById(authUser.id, {
      password: ADMIN_PASSWORD,
    });
    if (pwErr) {
      console.error('   ❌ Failed to update password:', pwErr.message);
    } else {
      console.log('   ✅ Password updated to Ajmal@890');
    }
  } else {
    console.log(`   ⚠️  User not found. Creating new auth user...`);
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: ADMIN_NAME },
    });

    if (createErr) {
      console.error('   ❌ Failed to create user:', createErr.message);
      process.exit(1);
    }

    authUser = newUser.user;
    console.log(`   ✅ Created auth user: ${authUser.email} (id: ${authUser.id})`);
  }

  // Step 2: Check/create profile
  console.log('\n── Step 2: Checking profile ──');
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (profileErr || !profile) {
    console.log('   ⚠️  Profile not found, creating...');
    const { error: insertErr } = await supabase.from('profiles').upsert({
      id: authUser.id,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      role: 'both',
      is_admin: true,
      reputation: 0,
      badges: [],
    });
    if (insertErr) {
      console.error('   ❌ Failed to create profile:', insertErr.message);
    } else {
      console.log('   ✅ Profile created with admin privileges');
    }
  } else {
    console.log(`   ✅ Profile exists: ${profile.name} (${profile.email})`);
  }

  // Step 3: Revoke admin from ALL other users
  console.log('\n── Step 3: Revoking admin from all other users ──');
  const { error: revokeErr } = await supabase
    .from('profiles')
    .update({ is_admin: false })
    .neq('id', authUser.id);

  if (revokeErr) {
    console.error('   ⚠️  Revoke error:', revokeErr.message);
  } else {
    console.log('   ✅ Revoked admin from all other users');
  }

  // Step 4: Set this user as admin
  console.log('\n── Step 4: Setting admin privileges ──');
  const { data: updated, error: updateErr } = await supabase
    .from('profiles')
    .update({ is_admin: true })
    .eq('id', authUser.id)
    .select('id, name, email, is_admin')
    .single();

  if (updateErr) {
    console.error('   ❌ Failed to set admin:', updateErr.message);
    process.exit(1);
  }

  console.log(`   ✅ ${updated.name} is now ADMIN`);

  // Step 5: Verify
  console.log('\n── Step 5: Final Verification ──');
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('name, email, is_admin')
    .order('is_admin', { ascending: false });

  console.log('   All users:');
  allProfiles.forEach(p => {
    const badge = p.is_admin ? '🛡️ ADMIN' : '  user';
    console.log(`     ${badge} — ${p.name} (${p.email})`);
  });

  console.log('\n🎉 DONE! Admin account ready:');
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log('   Login at your site and navigate to /admin');
}

setupAdmin().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
