import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import { AdminNav } from './AdminDashboard';
import api from '../../api/client';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminProblems() {
  usePageTitle('Moderate Problems — Admin');
  const [problems, setProblems] = useState([]);
  const [pagination, setPagination] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const location = useLocation();

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      const data = await api.get(`/admin/problems?${params}`);
      setProblems(data.problems);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Failed to load problems');
    }
    setLoading(false);
  }, [page, statusFilter, categoryFilter]);

  useEffect(() => { fetchProblems(); }, [fetchProblems]);

  const handleStatusChange = async (problemId, status) => {
    try {
      await api.put(`/admin/problems/${problemId}/status`, { status });
      toast.success(`Status changed to ${status}`);
      fetchProblems();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (problemId) => {
    try {
      await api.delete(`/admin/problems/${problemId}`);
      toast.success('Problem deleted');
      setConfirmDelete(null);
      fetchProblems();
    } catch (err) {
      toast.error('Failed to delete problem');
    }
  };

  const categories = ['mechanical', 'electrical', 'civil', 'software', 'environmental', 'biomedical', 'chemical', 'aerospace'];

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <div>
          <h1>📋 Problem Moderation</h1>
          <p>Review and manage all submitted problems</p>
        </div>
      </div>

      <AdminNav current={location.pathname} />

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h2>All Problems ({pagination.total || 0})</h2>
          <div className="admin-filters">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="solved">Solved</option>
            </select>
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="admin-empty">
            <div className="auth-spinner" />
          </div>
        ) : problems.length === 0 ? (
          <div className="admin-empty">
            <span>📋</span>
            <p>No problems found</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Status</th>
                <th>Urgency</th>
                <th>Votes</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map(problem => (
                <tr key={problem.id}>
                  <td>
                    <a
                      href={`/problems/${problem.id}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}
                    >
                      {problem.title.length > 40 ? problem.title.slice(0, 40) + '...' : problem.title}
                    </a>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {problem.author?.name || 'Unknown'}
                  </td>
                  <td>
                    <span className="admin-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
                      {problem.category}
                    </span>
                  </td>
                  <td>
                    <select
                      value={problem.status}
                      onChange={(e) => handleStatusChange(problem.id, e.target.value)}
                      style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 6,
                        color: 'var(--text-primary)',
                        padding: '0.3rem 0.5rem',
                        fontSize: '0.8rem',
                      }}
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="solved">Solved</option>
                    </select>
                  </td>
                  <td>
                    <span className={`admin-badge ${problem.urgency}`}>
                      {problem.urgency}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{problem.votes}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {new Date(problem.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="admin-btn danger"
                      onClick={() => setConfirmDelete(problem)}
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
            <h3>⚠️ Delete Problem</h3>
            <p>
              Are you sure you want to delete "<strong>{confirmDelete.title}</strong>"?
              All related solutions and comments will also be deleted.
            </p>
            <div className="confirm-actions">
              <button className="admin-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="admin-btn danger" onClick={() => handleDelete(confirmDelete.id)}>Delete Problem</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
