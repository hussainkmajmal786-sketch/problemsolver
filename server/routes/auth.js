import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import supabase from '../config/supabase.js';
import auth from '../middleware/auth.js';
import { registerRules, loginRules, handleValidation } from '../middleware/validate.js';

const router = Router();

// ─── POST /api/auth/register ─────────────────────
router.post('/register', registerRules, handleValidation, async (req, res, next) => {
  try {
    const { name, email, password, role, bio } = req.body;

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (authError) {
      const status = authError.message.includes('already') ? 400 : 500;
      return res.status(status).json({ success: false, message: authError.message });
    }

    const userId = authData.user.id;

    // Update profile with additional fields
    await supabase
      .from('profiles')
      .update({ role: role || 'both', bio: bio || '' })
      .eq('id', userId);

    // Sign in to get tokens
    const { data: signIn, error: signError } = await supabase.auth.signInWithPassword({ email, password });
    if (signError) {
      return res.status(500).json({ success: false, message: 'Account created but login failed. Try signing in.' });
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    res.status(201).json({
      success: true,
      token: signIn.session.access_token,
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        bio: profile.bio,
        avatar: profile.avatar,
        reputation: profile.reputation,
        badges: profile.badges,
        is_admin: profile.is_admin || false,
        createdAt: profile.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/auth/login ────────────────────────
router.post('/login', loginRules, handleValidation, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      success: true,
      token: data.session.access_token,
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        bio: profile.bio,
        avatar: profile.avatar,
        reputation: profile.reputation,
        badges: profile.badges,
        is_admin: profile.is_admin || false,
        createdAt: profile.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/auth/me ────────────────────────────
router.get('/me', auth, async (req, res) => {
  const u = req.user;
  res.json({
    success: true,
    user: {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      bio: u.bio,
      avatar: u.avatar,
      reputation: u.reputation,
      badges: u.badges,
      is_admin: u.is_admin || false,
      createdAt: u.created_at,
    },
  });
});

// ─── PUT /api/auth/profile ───────────────────────
router.put('/profile', auth, async (req, res, next) => {
  try {
    const { name, bio, role } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (role) updates.role = role;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        bio: data.bio,
        avatar: data.avatar,
        reputation: data.reputation,
        badges: data.badges,
        is_admin: data.is_admin || false,
        createdAt: data.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
