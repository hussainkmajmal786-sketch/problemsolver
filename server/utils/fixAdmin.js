import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function fixAdmin() {
  console.log('🔍 Diagnosing admin setup...\n');
  console.log(`   Supabase URL: ${process.env.SUPABASE_URL}\n`);

  // Step 1: Check if is_admin column exists by listing all profiles
  console.log('── Step 1: Listing ALL profiles ──');
  const { data: allProfiles, error: listErr } = await supabase
    .from('profiles')
    .select('id, name, email, is_admin')
    .order('created_at', { ascending: true });

  if (listErr) {
    console.error('❌ Error listing profiles:', listErr.message);
    if (listErr.message.includes('is_admin')) {
      console.log('\n⚠️  The is_admin column does NOT exist!');
      console.log('   Run this SQL in Supabase SQL Editor:\n');
      console.log('   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;\n');
    }
    process.exit(1);
  }

  if (!allProfiles || allProfiles.length === 0) {
    console.log('⚠️  No profiles found in the database!');
    process.exit(1);
  }

  console.log(`   Found ${allProfiles.length} user(s):\n`);
  allProfiles.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name || '(no name)'} — ${p.email} — admin: ${p.is_admin} — id: ${p.id}`);
  });

  // Step 2: Check the target admin email
  const adminEmail = 'hussainkmajmal786@gmail.com';
  console.log(`\n── Step 2: Looking for admin account: ${adminEmail} ──`);
  
  const targetProfile = allProfiles.find(p => p.email === adminEmail);
  
  if (!targetProfile) {
    console.log(`⚠️  Account "${adminEmail}" NOT FOUND in profiles!`);
    console.log('   Available emails:', allProfiles.map(p => p.email).join(', '));
    console.log('\n   The user needs to register first at the website, then re-run this script.');
    process.exit(1);
  }

  console.log(`   ✅ Found: ${targetProfile.name} (${targetProfile.email})`);
  console.log(`   Current is_admin: ${targetProfile.is_admin}`);

  // Step 3: Verify via Supabase Auth
  console.log('\n── Step 3: Checking Supabase Auth users ──');
  const { data: authUsers, error: authErr } = await supabase.auth.admin.listUsers();
  
  if (authErr) {
    console.error('❌ Error listing auth users:', authErr.message);
  } else {
    const authUser = authUsers.users.find(u => u.email === adminEmail);
    if (authUser) {
      console.log(`   ✅ Auth user exists: ${authUser.email}`);
      console.log(`   Auth ID: ${authUser.id}`);
      console.log(`   Profile ID: ${targetProfile.id}`);
      console.log(`   IDs match: ${authUser.id === targetProfile.id}`);
      console.log(`   Email confirmed: ${authUser.email_confirmed_at ? 'YES' : 'NO'}`);
      console.log(`   Created: ${authUser.created_at}`);
    } else {
      console.log(`   ⚠️  No auth user found for ${adminEmail}`);
      console.log('   Auth users:', authUsers.users.map(u => u.email).join(', '));
    }
  }

  // Step 4: Fix — Set is_admin = true
  console.log('\n── Step 4: Setting is_admin = TRUE ──');
  
  // First, revoke admin from ALL users
  const { error: revokeErr } = await supabase
    .from('profiles')
    .update({ is_admin: false })
    .neq('id', targetProfile.id);

  if (revokeErr) {
    console.log('   ⚠️  Could not revoke others:', revokeErr.message);
  } else {
    console.log('   ✅ Revoked admin from all other users');
  }

  // Set admin for the target user
  const { data: updated, error: updateErr } = await supabase
    .from('profiles')
    .update({ is_admin: true })
    .eq('id', targetProfile.id)
    .select('id, name, email, is_admin')
    .single();

  if (updateErr) {
    console.error('❌ Failed to update:', updateErr.message);
    console.log('\n   This might be an RLS issue. Run this SQL in Supabase SQL Editor:\n');
    console.log(`   UPDATE profiles SET is_admin = true WHERE email = '${adminEmail}';`);
    process.exit(1);
  }

  console.log(`   ✅ Updated: ${updated.name} — is_admin: ${updated.is_admin}`);

  // Step 5: Verify
  console.log('\n── Step 5: Verification ──');
  const { data: verify } = await supabase
    .from('profiles')
    .select('id, name, email, is_admin')
    .eq('email', adminEmail)
    .single();

  console.log(`   Name: ${verify.name}`);
  console.log(`   Email: ${verify.email}`);
  console.log(`   is_admin: ${verify.is_admin}`);
  console.log(`   ID: ${verify.id}`);
  
  if (verify.is_admin === true) {
    console.log('\n🎉 SUCCESS! Admin is properly set.');
    console.log('   Login with: hussainkmajmal786@gmail.com / Ajmal@786');
    console.log('   Then navigate to /admin');
  } else {
    console.log('\n❌ FAILED — is_admin is still not true!');
    console.log('   You need to run this SQL manually in Supabase SQL Editor:\n');
    console.log(`   UPDATE profiles SET is_admin = true WHERE email = '${adminEmail}';`);
  }
}

fixAdmin().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
