import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import api from '../../api/client';
import './Admin.css';

export default function AdminDashboard() {
  usePageTitle('Admin Dashboard');
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.get('/admin/dashboard');
        setStats(data.stats);
        setActivity(data.activity);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      }
      setLoading(false);
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminNav current={location.pathname} />
        <div className="admin-stats">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="stat-card" style={{ height: 130 }}>
              <div className="skeleton-line" style={{ width: '40%', height: 16 }} />
              <div className="skeleton-line" style={{ width: '60%', height: 36, marginTop: 8 }} />
              <div className="skeleton-line" style={{ width: '50%', height: 14, marginTop: 8 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: '👥', label: 'Total Users', value: stats?.totalUsers || 0 },
    { icon: '📋', label: 'Total Problems', value: stats?.totalProblems || 0 },
    { icon: '💡', label: 'Total Solutions', value: stats?.totalSolutions || 0 },
    { icon: '💬', label: 'Total Comments', value: stats?.totalComments || 0 },
    { icon: '✅', label: 'Solved Problems', value: stats?.solvedProblems || 0 },
    { icon: '📊', label: 'Solve Rate', value: `${stats?.solveRate || 0}%` },
  ];

  // Build chart data
  const maxSignup = Math.max(...(activity?.signups?.map(s => s.count) || [1]), 1);
  const maxProblems = Math.max(...(activity?.problems?.map(p => p.count) || [1]), 1);
  const chartMax = Math.max(maxSignup, maxProblems);

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <div>
          <h1>⚙️ Admin Dashboard</h1>
          <p>Monitor and manage your ProblemSolver platform</p>
        </div>
      </div>

      <AdminNav current={location.pathname} />

      {/* Stats Grid */}
      <div className="admin-stats">
        {statCards.map((card, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Activity Chart */}
      {activity && (activity.signups?.length > 0 || activity.problems?.length > 0) && (
        <div className="admin-chart-section">
          <h3>📈 Last 30 Days Activity</h3>
          <div className="admin-chart">
            {activity.signups?.map((item, i) => (
              <div
                key={`s-${i}`}
                className="chart-bar signups"
                style={{ height: `${(item.count / chartMax) * 100}%`, minHeight: 4 }}
                data-tooltip={`${item.date}: ${item.count} signups`}
              />
            ))}
            {activity.problems?.map((item, i) => (
              <div
                key={`p-${i}`}
                className="chart-bar problems"
                style={{ height: `${(item.count / chartMax) * 100}%`, minHeight: 4 }}
                data-tooltip={`${item.date}: ${item.count} problems`}
              />
            ))}
          </div>
          <div className="chart-legend">
            <span><span className="dot signups" /> Signups</span>
            <span><span className="dot problems" /> Problems</span>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="admin-quick-links">
        <Link to="/admin/users" className="quick-link-card">
          <div className="ql-icon">👥</div>
          <div className="ql-info">
            <h3>Manage Users</h3>
            <p>View, edit roles, or remove user accounts</p>
          </div>
        </Link>
        <Link to="/admin/problems" className="quick-link-card">
          <div className="ql-icon">📋</div>
          <div className="ql-info">
            <h3>Moderate Problems</h3>
            <p>Review, update status, or delete problems</p>
          </div>
        </Link>
        <Link to="/admin/comments" className="quick-link-card">
          <div className="ql-icon">💬</div>
          <div className="ql-info">
            <h3>Moderate Comments</h3>
            <p>Review and remove inappropriate comments</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

// Shared Admin Navigation
export function AdminNav({ current }) {
  const links = [
    { to: '/admin', label: '📊 Dashboard' },
    { to: '/admin/users', label: '👥 Users' },
    { to: '/admin/problems', label: '📋 Problems' },
    { to: '/admin/comments', label: '💬 Comments' },
  ];

  return (
    <nav className="admin-nav">
      {links.map(link => (
        <Link
          key={link.to}
          to={link.to}
          className={current === link.to ? 'active' : ''}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
