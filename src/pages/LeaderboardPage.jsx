import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BADGES } from '../data/sampleData';
import { SkeletonLeaderRow } from '../components/Skeleton';
import api from '../api/client';
import usePageTitle from '../hooks/usePageTitle';
import './LeaderboardPage.css';

export default function LeaderboardPage() {
  usePageTitle('Community Leaderboard');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/users/leaderboard', { limit: 20 });
        setUsers(data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetch();
  }, []);

  const top3 = users.slice(0, 3);

  if (loading) {
    return (
      <div className="page-wrapper leaderboard-page">
        <div className="container">
          <div className="text-center mb-2xl">
            <h1 className="heading-lg">Community <span className="text-gradient">Leaderboard</span></h1>
            <p className="text-secondary mt-sm">Top contributors making the biggest impact.</p>
          </div>
          <div className="lb-list glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonLeaderRow key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper leaderboard-page">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-2xl">
            <h1 className="heading-lg">Community <span className="text-gradient">Leaderboard</span></h1>
            <p className="text-secondary mt-sm">Top contributors making the biggest impact.</p>
          </div>

          <div className="podium" id="podium">
            {[1, 0, 2].map((idx) => {
              const u = top3[idx];
              if (!u) return null;
              const rank = idx + 1;
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <motion.div key={u._id || u.id} className={`podium-item rank-${rank}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.15 }}>
                  <span className="podium-medal">{medals[idx]}</span>
                  <div className={`avatar avatar-lg ${rank === 1 ? 'avatar-xl' : ''}`} style={rank === 1 ? { boxShadow: '0 0 30px rgba(249,115,22,0.3)' } : {}}>
                    {u.name.charAt(0)}
                  </div>
                  <h3 className="font-semibold">{u.name}</h3>
                  <span className="text-gradient font-bold" style={{ fontSize: '1.25rem' }}>{u.reputation}</span>
                  <span className="text-xs text-muted">reputation</span>
                  <div className="podium-stats">
                    <span className="text-xs text-secondary">{u.problemsPosted || 0} problems</span>
                    <span className="text-xs text-secondary">{u.solutionsGiven || 0} solutions</span>
                  </div>
                  <div className="podium-badges">
                    {(u.badges || []).slice(0, 3).map((b) => <span key={b} title={BADGES[b]?.name}>{BADGES[b]?.icon}</span>)}
                  </div>
                  <div className={`podium-bar bar-${rank}`} />
                </motion.div>
              );
            })}
          </div>

          <div className="lb-list" id="leaderboard-list">
            <div className="lb-list-header">
              <span>Rank</span><span>Member</span><span>Reputation</span>
              <span className="hide-mobile">Solutions</span><span className="hide-mobile">Badges</span>
            </div>
            {users.map((u, i) => (
              <motion.div key={u._id || u.id} className="lb-list-row glass-card" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <span className="lb-rank">#{i + 1}</span>
                <div className="lb-user">
                  <div className="avatar avatar-sm">{u.name.charAt(0)}</div>
                  <div>
                    <span className="font-semibold text-sm">{u.name}</span>
                    <span className="text-xs text-muted" style={{ display: 'block' }}>{u.role}</span>
                  </div>
                </div>
                <span className="lb-rep font-bold">{u.reputation}</span>
                <span className="text-sm text-secondary hide-mobile">{u.solutionsGiven || 0}</span>
                <div className="lb-badges hide-mobile">
                  {(u.badges || []).map((b) => <span key={b} title={BADGES[b]?.name}>{BADGES[b]?.icon}</span>)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
