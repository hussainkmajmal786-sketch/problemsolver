import { Router } from 'express';
import supabase from '../config/supabase.js';

const router = Router();

// ─── GET /api/users/leaderboard ─────────────────
router.get('/leaderboard', async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('reputation', { ascending: false })
      .limit(Math.min(50, parseInt(limit)));

    if (error) throw error;

    // Enrich with counts
    const enriched = await Promise.all(
      (users || []).map(async (user) => {
        const [{ count: problemsPosted }, { count: solutionsGiven }] = await Promise.all([
          supabase.from('problems').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
          supabase.from('solutions').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
        ]);
        return {
          ...user,
          _id: user.id,
          problemsPosted: problemsPosted || 0,
          solutionsGiven: solutionsGiven || 0,
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/users/:id ─────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [{ count: problemsPosted }, { count: solutionsGiven }, { data: problems }, { data: solutions }] = await Promise.all([
      supabase.from('problems').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
      supabase.from('solutions').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
      supabase.from('problems').select('id, title, status, votes, created_at, category').eq('author_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('solutions').select('id, title, votes, is_accepted, problem_id, created_at').eq('author_id', user.id).order('created_at', { ascending: false }).limit(10),
    ]);

    const recentProblems = (problems || []).map((p) => ({ ...p, _id: p.id }));

    res.json({
      success: true,
      data: {
        ...user,
        _id: user.id,
        problemsPosted: problemsPosted || 0,
        solutionsGiven: solutionsGiven || 0,
        recentProblems,
        recentSolutions: solutions || [],
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
