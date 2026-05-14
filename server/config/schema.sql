-- ═══════════════════════════════════════════════════
-- ProblemSolver — Supabase Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL)
-- ═══════════════════════════════════════════════════

-- ─── Profiles (extends Supabase Auth users) ──────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'both' CHECK (role IN ('poster', 'engineer', 'student', 'both')),
  bio TEXT DEFAULT '',
  avatar TEXT,
  reputation INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_reputation ON profiles(reputation DESC);
CREATE INDEX idx_profiles_email ON profiles(email);

-- ─── Problems ────────────────────────────────────
CREATE TABLE IF NOT EXISTS problems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('mechanical', 'electrical', 'civil', 'software', 'environmental', 'biomedical', 'chemical', 'aerospace')),
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'solved')),
  author_id UUID REFERENCES profiles(id) NOT NULL,
  votes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  location TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_problems_category ON problems(category);
CREATE INDEX idx_problems_status ON problems(status);
CREATE INDEX idx_problems_urgency ON problems(urgency);
CREATE INDEX idx_problems_votes ON problems(votes DESC);
CREATE INDEX idx_problems_created ON problems(created_at DESC);
CREATE INDEX idx_problems_author ON problems(author_id);

-- ─── Problem Votes (junction table) ─────────────
CREATE TABLE IF NOT EXISTS problem_votes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, problem_id)
);

-- ─── Solutions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS solutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_solutions_problem ON solutions(problem_id);
CREATE INDEX idx_solutions_votes ON solutions(votes DESC);

-- ─── Solution Votes (junction table) ────────────
CREATE TABLE IF NOT EXISTS solution_votes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  solution_id UUID REFERENCES solutions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, solution_id)
);

-- ─── Comments ────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_problem ON comments(problem_id);

-- ═══════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, users can update own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Problems: anyone can read, auth users can create, authors can update/delete
CREATE POLICY "Problems are viewable by everyone" ON problems FOR SELECT USING (true);
CREATE POLICY "Auth users can create problems" ON problems FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own problems" ON problems FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete own problems" ON problems FOR DELETE USING (auth.uid() = author_id);

-- Problem votes: anyone can read, auth users can manage own
CREATE POLICY "Votes are viewable" ON problem_votes FOR SELECT USING (true);
CREATE POLICY "Auth users can vote" ON problem_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own vote" ON problem_votes FOR DELETE USING (auth.uid() = user_id);

-- Solutions: same pattern
CREATE POLICY "Solutions are viewable" ON solutions FOR SELECT USING (true);
CREATE POLICY "Auth users can create solutions" ON solutions FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update solutions" ON solutions FOR UPDATE USING (auth.uid() = author_id);

-- Solution votes
CREATE POLICY "Sol votes viewable" ON solution_votes FOR SELECT USING (true);
CREATE POLICY "Auth users can vote sol" ON solution_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove own sol vote" ON solution_votes FOR DELETE USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "Comments viewable" ON comments FOR SELECT USING (true);
CREATE POLICY "Auth users can comment" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- ═══════════════════════════════════════════════════
-- AUTO-CREATE PROFILE ON SIGNUP
-- ═══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════
-- HELPER: Count solutions & comments for a problem
-- ═══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_problem_counts(p_id UUID)
RETURNS TABLE(solution_count BIGINT, comment_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM solutions WHERE problem_id = p_id),
    (SELECT COUNT(*) FROM comments WHERE problem_id = p_id);
END;
$$ LANGUAGE plpgsql;
