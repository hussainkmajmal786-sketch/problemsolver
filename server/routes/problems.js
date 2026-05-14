import { Router } from 'express';
import supabase from '../config/supabase.js';
import auth from '../middleware/auth.js';
import { createProblemRules, handleValidation } from '../middleware/validate.js';

const router = Router();

// ─── GET /api/problems ───────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { category, status, urgency, search, sort = 'newest', page = 1, limit = 12 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase
      .from('problems')
      .select('*, author:profiles!author_id(id, name, avatar, reputation)', { count: 'exact' });

    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (urgency) query = query.eq('urgency', urgency);
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

    // Sort
    const sortMap = {
      newest: { col: 'created_at', asc: false },
      oldest: { col: 'created_at', asc: true },
      'most-voted': { col: 'votes', asc: false },
      'most-viewed': { col: 'views', asc: false },
    };
    const s = sortMap[sort] || sortMap.newest;
    query = query.order(s.col, { ascending: s.asc });
    query = query.range(from, to);

    const { data: problems, count, error } = await query;
    if (error) throw error;

    // Fetch solution/comment counts
    const ids = problems.map((p) => p.id);
    const [solCounts, comCounts] = await Promise.all([
      supabase.from('solutions').select('problem_id').in('problem_id', ids.length ? ids : ['none']),
      supabase.from('comments').select('problem_id').in('problem_id', ids.length ? ids : ['none']),
    ]);

    const solMap = {};
    const comMap = {};
    (solCounts.data || []).forEach((s) => { solMap[s.problem_id] = (solMap[s.problem_id] || 0) + 1; });
    (comCounts.data || []).forEach((c) => { comMap[c.problem_id] = (comMap[c.problem_id] || 0) + 1; });

    const enriched = problems.map((p) => ({
      ...p,
      _id: p.id,
      solutionCount: solMap[p.id] || 0,
      commentCount: comMap[p.id] || 0,
    }));

    res.json({
      success: true,
      data: enriched,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        pages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/problems/:id ───────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Increment views
    const { data: current } = await supabase.from('problems').select('views').eq('id', id).single();
    if (current) {
      await supabase.from('problems').update({ views: (current.views || 0) + 1 }).eq('id', id);
    }

    const { data: problem, error } = await supabase
      .from('problems')
      .select('*, author:profiles!author_id(id, name, avatar, reputation, badges, bio)')
      .eq('id', id)
      .single();

    if (error || !problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // Fetch votedBy list
    const { data: votes } = await supabase
      .from('problem_votes')
      .select('user_id')
      .eq('problem_id', id);

    problem._id = problem.id;
    problem.votedBy = (votes || []).map((v) => v.user_id);

    // Update views in response
    problem.views = (problem.views || 0) + 1;

    res.json({ success: true, data: problem });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/problems ─────────────────────────
router.post('/', auth, createProblemRules, handleValidation, async (req, res, next) => {
  try {
    const { title, description, category, urgency, location, tags } = req.body;

    const { data: problem, error } = await supabase
      .from('problems')
      .insert({
        title, description, category,
        urgency: urgency || 'medium',
        location: location || null,
        tags: tags || [],
        author_id: req.user.id,
      })
      .select('*, author:profiles!author_id(id, name, avatar, reputation)')
      .single();

    if (error) throw error;

    // Award reputation
    await supabase.from('profiles').update({ reputation: req.user.reputation + 5 }).eq('id', req.user.id);

    problem._id = problem.id;
    res.status(201).json({ success: true, data: problem });
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/problems/:id ──────────────────────
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check ownership
    const { data: existing } = await supabase.from('problems').select('author_id').eq('id', id).single();
    if (!existing) return res.status(404).json({ success: false, message: 'Problem not found' });
    if (existing.author_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    const { title, description, category, urgency, status, location, tags } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (category) updates.category = category;
    if (urgency) updates.urgency = urgency;
    if (status) updates.status = status;
    if (location !== undefined) updates.location = location;
    if (tags) updates.tags = tags;

    const { data, error } = await supabase
      .from('problems')
      .update(updates)
      .eq('id', id)
      .select('*, author:profiles!author_id(id, name, avatar, reputation)')
      .single();

    if (error) throw error;
    data._id = data.id;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/problems/:id ───────────────────
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: existing } = await supabase.from('problems').select('author_id').eq('id', id).single();
    if (!existing) return res.status(404).json({ success: false, message: 'Problem not found' });
    if (existing.author_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    const { error } = await supabase.from('problems').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Problem deleted' });
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/problems/:id/vote ────────────────
router.post('/:id/vote', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if already voted
    const { data: existing } = await supabase
      .from('problem_votes')
      .select('user_id')
      .eq('problem_id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      // Remove vote
      await supabase.from('problem_votes').delete().eq('problem_id', id).eq('user_id', userId);
      const { data: p } = await supabase.from('problems').select('votes').eq('id', id).single();
      await supabase.from('problems').update({ votes: Math.max(0, (p?.votes || 1) - 1) }).eq('id', id);
    } else {
      // Add vote
      await supabase.from('problem_votes').insert({ problem_id: id, user_id: userId });
      const { data: p } = await supabase.from('problems').select('votes, author_id').eq('id', id).single();
      await supabase.from('problems').update({ votes: (p?.votes || 0) + 1 }).eq('id', id);

      // Award reputation to problem author
      if (p && p.author_id !== userId) {
        const { data: author } = await supabase.from('profiles').select('reputation').eq('id', p.author_id).single();
        if (author) await supabase.from('profiles').update({ reputation: author.reputation + 2 }).eq('id', p.author_id);
      }
    }

    // Return updated vote count
    const { data: updated } = await supabase.from('problems').select('votes').eq('id', id).single();
    res.json({
      success: true,
      data: { votes: updated?.votes || 0, hasVoted: !existing },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
