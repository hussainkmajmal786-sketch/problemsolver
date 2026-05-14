import { Router } from 'express';
import supabase from '../config/supabase.js';
import auth from '../middleware/auth.js';
import { createSolutionRules, handleValidation } from '../middleware/validate.js';

const router = Router();

// ─── GET /api/solutions/problem/:problemId ──────
router.get('/problem/:problemId', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('solutions')
      .select('*, author:profiles!author_id(id, name, avatar, reputation, badges)')
      .eq('problem_id', req.params.problemId)
      .order('is_accepted', { ascending: false })
      .order('votes', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch votedBy for each solution
    const ids = (data || []).map((s) => s.id);
    const { data: allVotes } = ids.length
      ? await supabase.from('solution_votes').select('solution_id, user_id').in('solution_id', ids)
      : { data: [] };

    const voteMap = {};
    (allVotes || []).forEach((v) => {
      if (!voteMap[v.solution_id]) voteMap[v.solution_id] = [];
      voteMap[v.solution_id].push(v.user_id);
    });

    const enriched = (data || []).map((s) => ({
      ...s,
      _id: s.id,
      votedBy: voteMap[s.id] || [],
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/solutions/problem/:problemId ─────
router.post('/problem/:problemId', auth, createSolutionRules, handleValidation, async (req, res, next) => {
  try {
    const { problemId } = req.params;
    const { title, description } = req.body;

    // Check problem exists
    const { data: problem } = await supabase.from('problems').select('id, status').eq('id', problemId).single();
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    const { data: solution, error } = await supabase
      .from('solutions')
      .insert({ problem_id: problemId, author_id: req.user.id, title, description })
      .select('*, author:profiles!author_id(id, name, avatar, reputation, badges)')
      .single();

    if (error) throw error;

    // Update problem status
    if (problem.status === 'open') {
      await supabase.from('problems').update({ status: 'in-progress' }).eq('id', problemId);
    }

    // Award reputation
    await supabase.from('profiles').update({ reputation: req.user.reputation + 10 }).eq('id', req.user.id);

    solution._id = solution.id;
    solution.votedBy = [];
    res.status(201).json({ success: true, data: solution });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/solutions/:id/vote ───────────────
router.post('/:id/vote', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: existing } = await supabase
      .from('solution_votes')
      .select('user_id')
      .eq('solution_id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase.from('solution_votes').delete().eq('solution_id', id).eq('user_id', userId);
      const { data: s } = await supabase.from('solutions').select('votes').eq('id', id).single();
      await supabase.from('solutions').update({ votes: Math.max(0, (s?.votes || 1) - 1) }).eq('id', id);
    } else {
      await supabase.from('solution_votes').insert({ solution_id: id, user_id: userId });
      const { data: s } = await supabase.from('solutions').select('votes, author_id').eq('id', id).single();
      await supabase.from('solutions').update({ votes: (s?.votes || 0) + 1 }).eq('id', id);

      if (s && s.author_id !== userId) {
        const { data: author } = await supabase.from('profiles').select('reputation').eq('id', s.author_id).single();
        if (author) await supabase.from('profiles').update({ reputation: author.reputation + 3 }).eq('id', s.author_id);
      }
    }

    const { data: updated } = await supabase.from('solutions').select('votes').eq('id', id).single();
    res.json({ success: true, data: { votes: updated?.votes || 0, hasVoted: !existing } });
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/solutions/:id/accept ──────────────
router.put('/:id/accept', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: solution } = await supabase.from('solutions').select('*, problem:problems!problem_id(author_id)').eq('id', id).single();
    if (!solution) return res.status(404).json({ success: false, message: 'Solution not found' });

    if (solution.problem?.author_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the problem author can accept solutions' });
    }

    const newAccepted = !solution.is_accepted;
    await supabase.from('solutions').update({ is_accepted: newAccepted }).eq('id', id);

    if (newAccepted) {
      await supabase.from('problems').update({ status: 'solved' }).eq('id', solution.problem_id);
      const { data: solAuthor } = await supabase.from('profiles').select('reputation').eq('id', solution.author_id).single();
      if (solAuthor) await supabase.from('profiles').update({ reputation: solAuthor.reputation + 25 }).eq('id', solution.author_id);
    }

    res.json({ success: true, data: { ...solution, is_accepted: newAccepted, isAccepted: newAccepted } });
  } catch (error) {
    next(error);
  }
});

export default router;
