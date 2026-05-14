import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import { AdminNav } from './AdminDashboard';
import api from '../../api/client';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminUsers() {
  usePageTitle('Manage Users — Admin');
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const location = useLocation();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.append('search', search);
      const data = await api.get(`/admin/users?${params}`);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Failed to load users');
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      toast.success('Role updated');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleToggleAdmin = async (userId, currentAdmin) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { is_admin: !currentAdmin });
      toast.success(currentAdmin ? 'Admin privileges revoked' : 'Admin privileges granted');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update admin status');
    }
  };

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      setConfirmDelete(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <div>
          <h1>👥 User Management</h1>
          <p>View and manage all registered users</p>
        </div>
      </div>

      <AdminNav current={location.pathname} />

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h2>All Users ({pagination.total || 0})</h2>
          <form onSubmit={handleSearchSubmit} className="admin-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>

        {loading ? (
          <div className="admin-empty">
            <div className="auth-spinner" />
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty">
            <span>🔍</span>
            <p>No users found</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Reputation</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td><strong>{user.name}</strong></td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 6,
                        color: 'var(--text-primary)',
                        padding: '0.3rem 0.5rem',
                        fontSize: '0.8rem',
                      }}
                    >
                      <option value="poster">Poster</option>
                      <option value="engineer">Engineer</option>
                      <option value="student">Student</option>
                      <option value="both">Both</option>
                    </select>
                  </td>
                  <td>
                    <span className={`admin-badge ${user.is_admin ? 'admin' : 'user'}`}>
                      {user.is_admin ? '🛡️ Admin' : 'User'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{user.reputation}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className={`admin-btn ${user.is_admin ? 'danger' : 'success'}`}
                        onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                      >
                        {user.is_admin ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                      <button
                        className="admin-btn danger"
                        onClick={() => setConfirmDelete(user)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
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
            <h3>⚠️ Delete User</h3>
            <p>
              Are you sure you want to permanently delete <strong>{confirmDelete.name}</strong> ({confirmDelete.email})?
              This action cannot be undone.
            </p>
            <div className="confirm-actions">
              <button className="admin-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="admin-btn danger" onClick={() => handleDelete(confirmDelete.id)}>Delete User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
