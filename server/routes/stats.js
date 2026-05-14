import { Router } from 'express';
import supabase from '../config/supabase.js';

const router = Router();

// ─── GET /api/stats ─────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const [problems, solutions, users, solved] = await Promise.all([
      supabase.from('problems').select('*', { count: 'exact', head: true }),
      supabase.from('solutions').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('problems').select('*', { count: 'exact', head: true }).eq('status', 'solved'),
    ]);

    res.json({
      success: true,
      data: {
        problemCount: problems.count || 0,
        solutionCount: solutions.count || 0,
        userCount: users.count || 0,
        solvedCount: solved.count || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
