import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const seed = async () => {
  try {
    console.log('🗑️  Clearing existing data...');
    await supabase.from('solution_votes').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('problem_votes').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('solutions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('problems').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Delete existing auth users (profiles will cascade)
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    for (const u of (existingUsers?.users || [])) {
      await supabase.auth.admin.deleteUser(u.id);
    }

    console.log('👤 Creating users...');
    const userDefs = [
      { email: 'ajmal@example.com', name: 'Ajmal Hussain', role: 'engineer', bio: 'Full-stack engineer passionate about solving real-world problems through technology.', reputation: 2450, badges: ['pioneer', 'top-solver', 'mentor'] },
      { email: 'priya@example.com', name: 'Priya Sharma', role: 'student', bio: 'Civil engineering student at IIT. Interested in sustainable infrastructure.', reputation: 1820, badges: ['contributor', 'rising-star'] },
      { email: 'david@example.com', name: 'David Chen', role: 'both', bio: 'Mechanical engineer working on clean energy solutions. 10+ years experience.', reputation: 3200, badges: ['pioneer', 'top-solver', 'mentor', 'first-responder'] },
      { email: 'sara@example.com', name: 'Sara Al-Rashid', role: 'engineer', bio: 'Biomedical engineer focused on accessible healthcare technology for rural areas.', reputation: 2100, badges: ['contributor', 'innovator'] },
      { email: 'michael@example.com', name: 'Michael Torres', role: 'poster', bio: 'Community advocate bringing real-world problems to the engineering community.', reputation: 980, badges: ['contributor'] },
    ];

    const users = [];
    for (const def of userDefs) {
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email: def.email,
        password: 'demo123',
        email_confirm: true,
        user_metadata: { name: def.name },
      });
      if (authErr) { console.error(`  Failed: ${def.email}`, authErr.message); continue; }

      // Update profile with extra data
      await supabase.from('profiles').update({
        role: def.role,
        bio: def.bio,
        reputation: def.reputation,
        badges: def.badges,
      }).eq('id', authData.user.id);

      users.push({ id: authData.user.id, ...def });
      console.log(`   ✅ ${def.name} (${def.email})`);
    }

    if (users.length < 5) {
      console.error('❌ Not all users were created. Check Supabase config.');
      process.exit(1);
    }

    const [ajmal, priya, david, sara, michael] = users;

    console.log('📋 Creating problems...');
    const problemDefs = [
      { title: 'Clean Drinking Water Purification for Remote Villages', description: 'Many remote villages in developing countries lack access to clean drinking water. The existing purification systems are either too expensive, require electricity, or need regular maintenance.\n\nWe need a cost-effective, low-maintenance water purification solution that can:\n- Work without electricity or with minimal solar power\n- Handle at least 500 liters per day\n- Remove bacteria, viruses, and heavy metals\n- Be buildable with locally available materials\n- Cost under $200 to construct', category: 'environmental', urgency: 'critical', status: 'open', author_id: michael.id, votes: 142, views: 1840, location: 'Rural India', tags: ['water', 'sustainability', 'low-cost', 'rural'] },
      { title: 'Affordable Prosthetic Limbs Using 3D Printing', description: 'Traditional prosthetic limbs cost $5,000 to $50,000. With 3D printing, we can create functional prosthetics at a fraction of the cost.\n\nChallenges:\n- Cost under $100 in materials\n- Comfortable for daily use\n- Basic grip functions\n- Open-source design files\n- Printable on consumer-grade 3D printers', category: 'biomedical', urgency: 'high', status: 'in-progress', author_id: sara.id, votes: 98, views: 1200, location: 'Global', tags: ['3d-printing', 'prosthetics', 'accessibility'] },
      { title: 'Traffic Congestion Prediction System for Smart Cities', description: 'Our city experiences severe traffic congestion during peak hours.\n\nRequirements:\n- Real-time traffic flow analysis using CCTV\n- ML model to predict congestion 30-60 min ahead\n- Traffic signal integration\n- Public dashboard\n- Mobile app for route suggestions', category: 'software', urgency: 'medium', status: 'open', author_id: priya.id, votes: 76, views: 890, location: 'Bangalore, India', tags: ['smart-city', 'machine-learning', 'iot'] },
      { title: 'Solar-Powered Crop Drying System for Small Farmers', description: 'Small-scale farmers lose 30% of harvest due to inadequate drying.\n\nSpecs:\n- Process 100-200 kg per batch\n- Reduce moisture from 25% to 12%\n- Work in tropical climates\n- Cost under $500\n- Minimal training to operate', category: 'mechanical', urgency: 'high', status: 'open', author_id: michael.id, votes: 64, views: 650, location: 'Sub-Saharan Africa', tags: ['agriculture', 'solar', 'food-security'] },
      { title: 'Earthquake-Resistant Low-Cost Housing Design', description: 'Urgent need for affordable housing that withstands earthquakes.\n\nRequirements:\n- Withstand magnitude 7.0\n- Cost under $3,000\n- Use local materials\n- Built by 4 workers in 2 weeks\n- Space for family of 5', category: 'civil', urgency: 'critical', status: 'in-progress', author_id: priya.id, votes: 118, views: 1560, location: 'Nepal', tags: ['disaster-resilience', 'affordable-housing'] },
      { title: 'Micro-Grid Power Distribution for Off-Grid Communities', description: 'Remote communities need reliable electricity.\n\nRequirements:\n- Hybrid solar + wind\n- 8+ hours battery backup\n- Smart load balancing\n- Prepaid metering\n- Modular design', category: 'electrical', urgency: 'high', status: 'open', author_id: david.id, votes: 87, views: 920, location: 'East Africa', tags: ['renewable-energy', 'micro-grid'] },
      { title: 'Biodegradable Packaging from Agricultural Waste', description: 'Single-use plastic is a major problem.\n\nTarget specs:\n- Comparable strength to cardboard\n- Biodegradable within 90 days\n- Water-resistant 24 hours\n- Raw material cost under $0.05/unit', category: 'chemical', urgency: 'medium', status: 'open', author_id: sara.id, votes: 55, views: 480, location: 'Southeast Asia', tags: ['sustainability', 'packaging'] },
      { title: 'Drone-Based Delivery System for Medical Supplies', description: 'Medical facilities in remote regions struggle to receive supplies.\n\nSpecs:\n- Payload: 2-5 kg\n- Range: 50+ km round trip\n- Weatherproof\n- Autonomous navigation\n- Temperature-controlled compartment', category: 'aerospace', urgency: 'high', status: 'solved', author_id: ajmal.id, votes: 156, views: 2100, location: 'Philippines', tags: ['drones', 'healthcare', 'autonomous'] },
      { title: 'AI-Powered Sign Language Translator App', description: 'Communication barriers for deaf individuals.\n\nFeatures:\n- Real-time gesture recognition\n- ASL support initially\n- Text-to-speech\n- Offline mode\n- 90%+ accuracy', category: 'software', urgency: 'medium', status: 'open', author_id: ajmal.id, votes: 93, views: 1100, location: 'Global', tags: ['accessibility', 'ai', 'computer-vision'] },
      { title: 'Low-Cost Air Quality Monitoring Network', description: 'Commercial AQI stations cost $15,000+.\n\nRequirements:\n- Measure PM2.5, PM10, CO, NO2, O3\n- Unit cost under $50\n- WiFi/LoRa connectivity\n- Weather-resistant\n- Open-source dashboard', category: 'environmental', urgency: 'medium', status: 'open', author_id: david.id, votes: 71, views: 730, location: 'Delhi, India', tags: ['iot', 'air-quality', 'open-source'] },
    ];

    const { data: problems, error: probErr } = await supabase
      .from('problems')
      .insert(problemDefs)
      .select();

    if (probErr) { console.error('Problem insert error:', probErr); process.exit(1); }
    console.log(`   ✅ ${problems.length} problems created`);

    // Add votes
    console.log('🗳️  Adding votes...');
    const voteData = [
      { problem: 0, voters: [ajmal, priya, david, sara] },
      { problem: 1, voters: [ajmal, michael] },
      { problem: 2, voters: [david] },
      { problem: 3, voters: [priya, sara] },
      { problem: 4, voters: [ajmal, david, michael] },
      { problem: 5, voters: [ajmal, sara, michael] },
      { problem: 6, voters: [priya] },
      { problem: 7, voters: [priya, david, sara, michael] },
      { problem: 8, voters: [priya, sara] },
      { problem: 9, voters: [ajmal, michael] },
    ];

    for (const v of voteData) {
      const inserts = v.voters.map((voter) => ({ user_id: voter.id, problem_id: problems[v.problem].id }));
      await supabase.from('problem_votes').insert(inserts);
    }
    console.log('   ✅ Votes added');

    // Solutions
    console.log('💡 Creating solutions...');
    const { data: solutions, error: solErr } = await supabase.from('solutions').insert([
      { problem_id: problems[0].id, author_id: david.id, title: 'Bio-Sand Filter with Silver Nanoparticle Enhancement', description: 'A multi-stage filtration system:\n\nStage 1: Coarse gravel pre-filter\nStage 2: Fine sand bio-filter\nStage 3: Activated charcoal\nStage 4: Silver nanoparticle ceramic filter\n\nCost: $120-150, Capacity: 600 liters/day, 99.7% bacteria removal.', votes: 45, is_accepted: false },
      { problem_id: problems[0].id, author_id: ajmal.id, title: 'Solar Still + UV Disinfection Hybrid System', description: 'Combining solar distillation with UV-C LED disinfection:\n\n- Solar still for primary purification\n- UV-C LED powered by small solar panel\n- Cost: $80-100\n- Output: 500-800 liters/day\n- Lifespan: 5+ years', votes: 38, is_accepted: false },
      { problem_id: problems[7].id, author_id: david.id, title: 'Fixed-Wing VTOL Hybrid Drone Design', description: 'Hybrid fixed-wing/VTOL drone for long-range medical delivery:\n\nAirframe: Carbon fiber, 2.5m wingspan\nPropulsion: Quad-motor VTOL + pusher\nPayload: 5kg temperature-controlled pod\nRange: 80km round trip at 60km/h\nNavigation: Dual GPS + LiDAR\n\n50+ successful deliveries.', votes: 67, is_accepted: true },
    ]).select();

    if (solErr) console.error('Solution insert error:', solErr);
    else console.log(`   ✅ ${solutions.length} solutions created`);

    // Comments
    console.log('💬 Creating comments...');
    const { data: c1 } = await supabase.from('comments').insert({
      problem_id: problems[0].id, author_id: priya.id,
      content: 'This is a critical issue. We faced similar challenges in our village. Have you considered rainwater harvesting?',
    }).select().single();

    await supabase.from('comments').insert({
      problem_id: problems[0].id, author_id: david.id,
      content: 'Great point! Rainwater harvesting combined with bio-sand filtration could be powerful. I\'ll update my solution.',
      parent_id: c1?.id || null,
    });

    await supabase.from('comments').insert({
      problem_id: problems[0].id, author_id: ajmal.id,
      content: 'What about Moringa seeds as a natural coagulant? They remove 90-99% of bacteria and are widely available.',
    });
    console.log('   ✅ 3 comments created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('──────────────────────────────');
    console.log(`   Users:     ${users.length}`);
    console.log(`   Problems:  ${problems.length}`);
    console.log(`   Solutions: ${solutions?.length || 0}`);
    console.log(`   Comments:  3`);
    console.log('──────────────────────────────');
    console.log('\n🔑 Demo login: ajmal@example.com / demo123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
