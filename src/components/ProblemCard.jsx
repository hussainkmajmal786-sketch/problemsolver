import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowUp, FiMessageSquare, FiEye, FiMapPin } from 'react-icons/fi';
import { FaCogs, FaBolt, FaHardHat, FaLaptopCode, FaLeaf, FaDna, FaFlask, FaRocket } from 'react-icons/fa';
import { CATEGORIES } from '../data/sampleData';
import './ProblemCard.css';

const ICON_MAP = {
  FaCogs, FaBolt, FaHardHat, FaLaptopCode, FaLeaf, FaDna, FaFlask, FaRocket,
};

export default function ProblemCard({ problem, index = 0 }) {
  const category = CATEGORIES.find((c) => c.id === problem.category);
  const author = problem.author || {};
  const IconComponent = category ? ICON_MAP[category.icon] : FaCogs;

  const statusLabel = {
    open: 'Open',
    'in-progress': 'In Progress',
    solved: 'Solved',
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link to={`/problems/${problem._id || problem.id}`} className="problem-card glass-card" id={`problem-card-${problem._id || problem.id}`}>
        {/* Card Header */}
        <div className="pc-header">
          <div className="pc-category-badge" style={{ borderColor: category?.color + '40', color: category?.color }}>
            {IconComponent && <IconComponent size={12} />}
            {category?.name}
          </div>
          <span className={`tag tag-sm status-${problem.status}`}>
            {statusLabel[problem.status]}
          </span>
        </div>

        {/* Title */}
        <h3 className="pc-title">{problem.title}</h3>

        {/* Description Preview */}
        <p className="pc-description">
          {problem.description.substring(0, 140)}...
        </p>

        {/* Tags */}
        <div className="pc-tags">
          {problem.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="pc-tag">#{tag}</span>
          ))}
          {problem.tags.length > 3 && (
            <span className="pc-tag pc-tag-more">+{problem.tags.length - 3}</span>
          )}
        </div>

        {/* Footer */}
        <div className="pc-footer">
          <div className="pc-author">
            <div className="avatar avatar-sm">
              {author?.name?.charAt(0) || '?'}
            </div>
            <div className="pc-author-info">
              <span className="pc-author-name">{author?.name || 'Anonymous'}</span>
              <span className="text-xs text-muted">{timeAgo(problem.createdAt || problem.created_at)}</span>
            </div>
          </div>

          <div className="pc-stats">
            <span className="pc-stat">
              <FiArrowUp size={14} /> {problem.votes}
            </span>
            <span className="pc-stat">
              <FiMessageSquare size={14} /> {problem.solutionCount}
            </span>
            <span className="pc-stat">
              <FiEye size={14} /> {problem.views}
            </span>
          </div>
        </div>

        {/* Urgency Indicator */}
        <div className={`pc-urgency urgency-${problem.urgency}`} />
      </Link>
    </motion.div>
  );
}
