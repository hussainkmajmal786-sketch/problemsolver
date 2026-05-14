import { Router } from 'express';
import supabase from '../config/supabase.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = Router();

// All admin routes require auth + admin
router.use(auth, adminAuth);

// ─── GET /api/admin/dashboard ────────────────────
// Aggregated platform statistics
router.get('/dashboard', async (req, res, next) => {
  try {
    const [
      { count: totalUsers },
      { count: totalProblems },
      { count: totalSolutions },
      { count: totalComments },
      { count: solvedProblems },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('problems').select('*', { count: 'exact', head: true }),
      supabase.from('solutions').select('*', { count: 'exact', head: true }),
      supabase.from('comments').select('*', { count: 'exact', head: true }),
      supabase.from('problems').select('*', { count: 'exact', head: true }).eq('status', 'solved'),
    ]);

    // Recent signups (last 30 days, grouped by day)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: true });

    const { data: recentProblems } = await supabase
      .from('problems')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: true });

    // Group by date
    const groupByDate = (items) => {
      const grouped = {};
      items?.forEach(item => {
        const date = item.created_at.split('T')[0];
        grouped[date] = (grouped[date] || 0) + 1;
      });
      return Object.entries(grouped).map(([date, count]) => ({ date, count }));
    };

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProblems,
        totalSolutions,
        totalComments,
        solvedProblems,
        solveRate: totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0,
      },
      activity: {
        signups: groupByDate(recentUsers),
        problems: groupByDate(recentProblems),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/admin/users ────────────────────────
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, count, error } = await query;
    if (error) throw error;

    res.json({
      success: true,
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/admin/users/:id/role ───────────────
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, is_admin } = req.body;

    const updates = {};
    if (role) updates.role = role;
    if (typeof is_admin === 'boolean') updates.is_admin = is_admin;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, user: data });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/admin/users/:id ─────────────────
router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own admin account.' });
    }

    // Delete from Supabase Auth (cascades to profiles)
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;

    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/admin/problems ─────────────────────
router.get('/problems', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('problems')
      .select('*, author:profiles!problems_author_id_fkey(id, name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);

    const { data: problems, count, error } = await query;
    if (error) throw error;

    res.json({
      success: true,
      problems,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/admin/problems/:id/status ──────────
router.put('/problems/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'in-progress', 'solved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const { data, error } = await supabase
      .from('problems')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, problem: data });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/admin/problems/:id ──────────────
router.delete('/problems/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('problems')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Problem deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/admin/comments ─────────────────────
router.get('/comments', async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const offset = (page - 1) * limit;

    const { data: comments, count, error } = await supabase
      .from('comments')
      .select('*, author:profiles!comments_author_id_fkey(id, name, email), problem:problems!comments_problem_id_fkey(id, title)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      comments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/admin/comments/:id ──────────────
router.delete('/comments/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Comment deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
