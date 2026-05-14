import { Router } from 'express';
import supabase from '../config/supabase.js';
import auth from '../middleware/auth.js';
import { createCommentRules, handleValidation } from '../middleware/validate.js';

const router = Router();

// ─── GET /api/comments/problem/:problemId ───────
router.get('/problem/:problemId', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*, author:profiles!author_id(id, name, avatar, reputation)')
      .eq('problem_id', req.params.problemId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const enriched = (data || []).map((c) => ({
      ...c,
      _id: c.id,
      parentId: c.parent_id,
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/comments/problem/:problemId ──────
router.post('/problem/:problemId', auth, createCommentRules, handleValidation, async (req, res, next) => {
  try {
    const { content, parentId } = req.body;

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        problem_id: req.params.problemId,
        author_id: req.user.id,
        content,
        parent_id: parentId || null,
      })
      .select('*, author:profiles!author_id(id, name, avatar, reputation)')
      .single();

    if (error) throw error;

    // Award reputation
    await supabase.from('profiles').update({ reputation: req.user.reputation + 1 }).eq('id', req.user.id);

    comment._id = comment.id;
    comment.parentId = comment.parent_id;
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
});

export default router;
