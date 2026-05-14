import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowUp, FiArrowLeft, FiMapPin, FiClock, FiEye, FiSend } from 'react-icons/fi';
import { FaCogs, FaBolt, FaHardHat, FaLaptopCode, FaLeaf, FaDna, FaFlask, FaRocket } from 'react-icons/fa';
import SolutionCard from '../components/SolutionCard';
import CommentThread from '../components/CommentThread';
import { SkeletonDetail } from '../components/Skeleton';
import { useProblems } from '../hooks/useProblems';
import { useSolutions } from '../hooks/useSolutions';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, URGENCY_LEVELS } from '../data/sampleData';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';
import './ProblemDetail.css';

const ICON_MAP = { FaCogs, FaBolt, FaHardHat, FaLaptopCode, FaLeaf, FaDna, FaFlask, FaRocket };

export default function ProblemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { getProblemById, voteProblem } = useProblems();
  const { solutions, comments, fetchSolutions, fetchComments, addSolution, voteSolution, acceptSolution, addComment } = useSolutions();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSolutionForm, setShowSolutionForm] = useState(false);
  const [solTitle, setSolTitle] = useState('');
  const [solDesc, setSolDesc] = useState('');
  const [voting, setVoting] = useState(false);

  usePageTitle(problem?.title || 'Problem Detail');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getProblemById(id);
        setProblem(data);
        await Promise.all([fetchSolutions(id), fetchComments(id)]);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="page-wrapper problem-detail-page">
        <div className="container">
          <Link to="/problems" className="back-link"><FiArrowLeft /> Back to Problems</Link>
          <SkeletonDetail />
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="page-wrapper flex-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <h2 className="heading-md">Problem not found</h2>
          <Link to="/problems" className="btn btn-primary mt-lg">Browse Problems</Link>
        </div>
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.id === problem.category);
  const author = problem.author || {};
  const urgency = URGENCY_LEVELS.find((u) => u.id === problem.urgency);
  const Icon = category ? ICON_MAP[category.icon] : FaCogs;
  const hasVoted = user && (problem.votedBy || []).some((v) => (v._id || v) === user.id || (v._id || v).toString() === user.id);
  const isAuthor = user && ((author._id || author.id) === user.id);

  const handleVote = async () => {
    if (!user) return toast.error('Please sign in to vote');
    if (voting) return;
    setVoting(true);
    try {
      const data = await voteProblem(problem._id);
      setProblem((prev) => ({ ...prev, votes: data.votes }));
      toast.success(data.hasVoted ? 'Upvoted!' : 'Vote removed');
    } catch { toast.error('Vote failed'); }
    setVoting(false);
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    if (!solTitle.trim() || !solDesc.trim()) return;
    try {
      await addSolution(problem._id, { title: solTitle.trim(), description: solDesc.trim() });
      setSolTitle(''); setSolDesc(''); setShowSolutionForm(false);
      toast.success('Solution submitted!');
    } catch (err) { toast.error(err.message || 'Failed to submit'); }
  };

  const handleAddComment = async (commentData) => {
    try {
      await addComment(problem._id, { content: commentData.content, parentId: commentData.parentId || null });
      toast.success('Comment posted!');
    } catch { toast.error('Failed to post comment'); }
  };

  const handleVoteSolution = async (solId) => {
    if (!user) return toast.error('Please sign in to vote');
    try { await voteSolution(solId); } catch { toast.error('Vote failed'); }
  };

  const handleAcceptSolution = async (solId) => {
    try { await acceptSolution(solId); toast.success('Solution accepted!'); } catch { toast.error('Failed'); }
  };

  const timeAgo = (dateStr) => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days < 30) return `${days} days ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const statusLabel = { open: 'Open', 'in-progress': 'In Progress', solved: 'Solved' };

  return (
    <div className="page-wrapper problem-detail-page">
      <div className="container">
        <Link to="/problems" className="back-link" id="back-to-problems"><FiArrowLeft /> Back to Problems</Link>
        <div className="pd-layout">
          <motion.main className="pd-main" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="pd-header">
              <div className="pd-meta">
                <span className="pc-category-badge" style={{ borderColor: category?.color + '40', color: category?.color }}>
                  {Icon && <Icon size={12} />} {category?.name}
                </span>
                <span className={`tag status-${problem.status}`}>{statusLabel[problem.status]}</span>
                <span className="tag" style={{ borderColor: urgency?.color + '40', color: urgency?.color, background: urgency?.color + '15', border: `1px solid ${urgency?.color}40` }}>
                  {urgency?.label} Priority
                </span>
              </div>
              <h1 className="heading-lg pd-title">{problem.title}</h1>
              <div className="pd-author-row">
                <div className="pd-author">
                  <div className="avatar avatar-sm">{author.name?.charAt(0)}</div>
                  <span className="font-medium text-sm">{author.name}</span>
                </div>
                <div className="pd-info-row">
                  <span className="pd-info"><FiClock size={14} /> {timeAgo(problem.createdAt || problem.created_at)}</span>
                  <span className="pd-info"><FiEye size={14} /> {problem.views} views</span>
                  {problem.location && <span className="pd-info"><FiMapPin size={14} /> {problem.location}</span>}
                </div>
              </div>
            </div>

            <div className="pd-description glass-card">
              <div className="pd-body">{problem.description}</div>
              <div className="pd-tags">
                {(problem.tags || []).map((tag) => <span key={tag} className="pc-tag">#{tag}</span>)}
              </div>
            </div>

            <div className="pd-solutions" id="solutions-section">
              <div className="flex-between mb-lg">
                <h2 className="heading-md">Solutions ({solutions.length})</h2>
                {user && <button className="btn btn-primary btn-sm" onClick={() => setShowSolutionForm(!showSolutionForm)} id="propose-solution-btn"><FiSend size={14} /> Propose Solution</button>}
              </div>

              {showSolutionForm && (
                <motion.form className="solution-form glass-card" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handleSubmitSolution}>
                  <h3 className="heading-sm mb-md">Your Solution</h3>
                  <div className="input-group mb-md"><label>Solution Title</label><input className="input" placeholder="A clear title for your approach..." value={solTitle} onChange={(e) => setSolTitle(e.target.value)} required id="solution-title-input" /></div>
                  <div className="input-group mb-md"><label>Detailed Description</label><textarea className="textarea" placeholder="Explain your solution in detail..." value={solDesc} onChange={(e) => setSolDesc(e.target.value)} rows={6} required id="solution-desc-input" /></div>
                  <div className="flex gap-sm">
                    <button type="submit" className="btn btn-primary" id="submit-solution-btn">Submit Solution</button>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowSolutionForm(false)}>Cancel</button>
                  </div>
                </motion.form>
              )}

              <div className="solutions-list">
                {solutions.length === 0 ? (
                  <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}><p className="text-muted">No solutions yet. Be the first to propose one!</p></div>
                ) : (
                  solutions.map((sol) => (
                    <SolutionCard key={sol._id || sol.id} solution={sol} onVote={handleVoteSolution} userId={user?.id} onAccept={handleAcceptSolution} isAuthor={isAuthor} />
                  ))
                )}
              </div>
            </div>

            <CommentThread comments={comments} onAddComment={handleAddComment} problemId={problem._id} userId={user?.id} />
          </motion.main>

          <aside className="pd-sidebar hide-mobile">
            <div className="pd-vote-widget glass-card">
              <button className={`vote-btn-lg ${hasVoted ? 'voted' : ''}`} onClick={handleVote} id="vote-btn"><FiArrowUp size={24} /></button>
              <span className="vote-count-lg">{problem.votes}</span>
              <span className="text-xs text-muted">upvotes</span>
            </div>
            <div className="pd-sidebar-stats glass-card">
              <div className="pd-stat-row"><span className="text-secondary text-sm">Solutions</span><span className="font-semibold">{solutions.length}</span></div>
              <div className="divider" />
              <div className="pd-stat-row"><span className="text-secondary text-sm">Comments</span><span className="font-semibold">{comments.length}</span></div>
              <div className="divider" />
              <div className="pd-stat-row"><span className="text-secondary text-sm">Views</span><span className="font-semibold">{problem.views}</span></div>
            </div>
            <div className="pd-author-card glass-card">
              <h4 className="text-xs text-muted font-semibold mb-sm" style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>Posted By</h4>
              <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                <div className="avatar">{author.name?.charAt(0)}</div>
                <div>
                  <span className="font-semibold text-sm" style={{ display: 'block' }}>{author.name}</span>
                  <span className="text-xs text-muted">⭐ {author.reputation || 0} rep</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
