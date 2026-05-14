import { motion } from 'framer-motion';
import { FiArrowUp, FiCheck } from 'react-icons/fi';
import './SolutionCard.css';

export default function SolutionCard({ solution, onVote, userId, onAccept, isAuthor }) {
  const author = solution.author || {};
  const solId = solution._id || solution.id;
  const hasVoted = userId && (solution.votedBy || []).some((v) => (v._id || v) === userId || (v._id || v).toString() === userId);

  return (
    <motion.div
      className={`solution-card glass-card ${solution.isAccepted ? 'accepted' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      id={`solution-${solId}`}
    >
      {solution.isAccepted && (
        <div className="accepted-badge"><FiCheck size={14} /> Accepted Solution</div>
      )}

      <div className="sc-header">
        <div className="sc-author">
          <div className="avatar avatar-sm">{author?.name?.charAt(0) || '?'}</div>
          <div>
            <span className="font-semibold text-sm">{author?.name || 'Anonymous'}</span>
            <span className="text-xs text-muted" style={{ display: 'block' }}>
              {new Date(solution.createdAt || solution.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="sc-vote">
          <button className={`vote-btn ${hasVoted ? 'voted' : ''}`} onClick={() => onVote?.(solId)} disabled={!userId}>
            <FiArrowUp size={18} />
          </button>
          <span className="vote-count">{solution.votes}</span>
        </div>
      </div>

      <h4 className="sc-title">{solution.title}</h4>
      <div className="sc-description">{solution.description}</div>

      {isAuthor && !solution.isAccepted && (
        <button className="btn btn-sm btn-secondary sc-accept-btn" onClick={() => onAccept?.(solId)}>
          <FiCheck size={14} /> Accept Solution
        </button>
      )}
    </motion.div>
  );
}
