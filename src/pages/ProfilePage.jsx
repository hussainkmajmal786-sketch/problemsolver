import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiEdit2, FiAward, FiMessageSquare, FiSend, FiCalendar, FiStar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { BADGES } from '../data/sampleData';
import api from '../api/client';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetch = async () => {
      try {
        const { data } = await api.get(`/users/${user.id}`);
        setProfile(data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (!user) {
    return (
      <div className="page-wrapper flex-center" style={{ minHeight: '60vh' }}>
        <div className="text-center glass-card" style={{ padding: '48px' }}>
          <h2 className="heading-md mb-md">Please Sign In</h2>
          <p className="text-secondary mb-lg">You need to be signed in to view your profile.</p>
          <Link to="/auth" className="btn btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="page-wrapper flex-center" style={{ minHeight: '60vh' }}><p className="text-muted">Loading...</p></div>;

  const p = profile || user;
  const userBadges = (p.badges || []).map((b) => BADGES[b]).filter(Boolean);

  return (
    <div className="page-wrapper profile-page">
      <div className="container">
        <motion.div className="profile-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="profile-header glass-panel">
            <div className="profile-cover" />
            <div className="profile-info">
              <div className="avatar avatar-xl profile-avatar">{p.name?.charAt(0).toUpperCase()}</div>
              <div className="profile-details">
                <h1 className="heading-lg">{p.name}</h1>
                <p className="text-secondary">{p.bio || 'No bio yet'}</p>
                <div className="profile-meta">
                  <span className="profile-meta-item"><FiCalendar size={14} /> Joined {new Date(p.createdAt || p.created_at || p.joinedAt).toLocaleDateString()}</span>
                  <span className="profile-meta-item"><FiStar size={14} /> {p.reputation || 0} reputation</span>
                  <span className="profile-meta-item tag tag-blue">{p.role || 'member'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-stats-grid">
            <div className="profile-stat-card glass-card"><FiSend size={24} style={{ color: 'var(--accent-blue)' }} /><span className="stat-value">{p.problemsPosted || 0}</span><span className="text-sm text-muted">Problems Posted</span></div>
            <div className="profile-stat-card glass-card"><FiMessageSquare size={24} style={{ color: 'var(--color-success)' }} /><span className="stat-value">{p.solutionsGiven || 0}</span><span className="text-sm text-muted">Solutions Given</span></div>
            <div className="profile-stat-card glass-card"><FiAward size={24} style={{ color: 'var(--accent-orange)' }} /><span className="stat-value">{userBadges.length}</span><span className="text-sm text-muted">Badges Earned</span></div>
            <div className="profile-stat-card glass-card"><FiStar size={24} style={{ color: 'var(--accent-purple)' }} /><span className="stat-value">{p.reputation || 0}</span><span className="text-sm text-muted">Reputation</span></div>
          </div>

          {userBadges.length > 0 && (
            <div className="profile-section">
              <h2 className="heading-md mb-lg"><FiAward style={{ marginRight: 8 }} /> Badges</h2>
              <div className="badges-grid">
                {userBadges.map((badge, i) => (
                  <motion.div key={i} className="badge-card glass-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                    <span className="badge-icon">{badge.icon}</span>
                    <span className="font-semibold text-sm">{badge.name}</span>
                    <span className="text-xs text-muted">{badge.description}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {profile?.recentProblems?.length > 0 && (
            <div className="profile-section">
              <h2 className="heading-md mb-lg">Recent Problems</h2>
              <div className="profile-list">
                {profile.recentProblems.map((prob) => (
                  <Link key={prob._id} to={`/problems/${prob._id}`} className="profile-list-item glass-card">
                    <span className="font-semibold text-sm">{prob.title}</span>
                    <div className="flex gap-sm mt-sm">
                      <span className={`tag tag-sm status-${prob.status}`}>{prob.status}</span>
                      <span className="text-xs text-muted">{prob.votes} votes</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
