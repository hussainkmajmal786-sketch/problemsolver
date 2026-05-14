import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Skeleton.css';

export default function Pagination({ page, pages, total, onPageChange }) {
  if (!pages || pages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const left = Math.max(2, page - delta);
    const right = Math.min(pages - 1, page + delta);

    range.push(1);
    if (left > 2) range.push('...');
    for (let i = left; i <= right; i++) range.push(i);
    if (right < pages - 1) range.push('...');
    if (pages > 1) range.push(pages);

    return range;
  };

  return (
    <div className="pagination" id="pagination">
      <button
        className="pagination-btn nav-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <FiChevronLeft size={16} /> Prev
      </button>

      {getVisiblePages().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="pagination-ellipsis">…</span>
        ) : (
          <button
            key={p}
            className={`pagination-btn ${p === page ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        className="pagination-btn nav-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        aria-label="Next page"
      >
        Next <FiChevronRight size={16} />
      </button>

      <span className="pagination-info">{total} total</span>
    </div>
  );
}
