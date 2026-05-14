import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import { AdminNav } from './AdminDashboard';
import api from '../../api/client';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminComments() {
  usePageTitle('Moderate Comments — Admin');
  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const location = useLocation();

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 30 });
      const data = await api.get(`/admin/comments?${params}`);
      setComments(data.comments);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Failed to load comments');
    }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/admin/comments/${commentId}`);
      toast.success('Comment deleted');
      setConfirmDelete(null);
      fetchComments();
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <div>
          <h1>💬 Comment Moderation</h1>
          <p>Review and remove inappropriate comments</p>
        </div>
      </div>

      <AdminNav current={location.pathname} />

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h2>All Comments ({pagination.total || 0})</h2>
        </div>

        {loading ? (
          <div className="admin-empty">
            <div className="auth-spinner" />
          </div>
        ) : comments.length === 0 ? (
          <div className="admin-empty">
            <span>💬</span>
            <p>No comments found</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Content</th>
                <th>Author</th>
                <th>Problem</th>
                <th>Posted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map(comment => (
                <tr key={comment.id}>
                  <td style={{ maxWidth: 350 }}>
                    <p style={{ margin: 0, lineHeight: 1.4, fontSize: '0.88rem' }}>
                      {comment.content.length > 100
                        ? comment.content.slice(0, 100) + '...'
                        : comment.content}
                    </p>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    <strong>{comment.author?.name || 'Unknown'}</strong>
                    <br />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {comment.author?.email}
                    </span>
                  </td>
                  <td>
                    {comment.problem ? (
                      <a
                        href={`/problems/${comment.problem.id}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.85rem' }}
                      >
                        {comment.problem.title?.length > 30
                          ? comment.problem.title.slice(0, 30) + '...'
                          : comment.problem.title}
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Deleted</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {new Date(comment.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="admin-btn danger"
                      onClick={() => setConfirmDelete(comment)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {pagination.pages > 1 && (
          <div className="admin-pagination">
            <span className="page-info">
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="page-btns">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <div className="confirm-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <h3>⚠️ Delete Comment</h3>
            <p>
              Are you sure you want to delete this comment by <strong>{confirmDelete.author?.name}</strong>?
            </p>
            <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              "{confirmDelete.content?.length > 120 ? confirmDelete.content.slice(0, 120) + '...' : confirmDelete.content}"
            </div>
            <div className="confirm-actions">
              <button className="admin-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="admin-btn danger" onClick={() => handleDelete(confirmDelete.id)}>Delete Comment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
