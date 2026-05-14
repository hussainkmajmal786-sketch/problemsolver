import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiMail, FiHeart } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <h3 className="footer-logo">
              Problem<span className="text-gradient">Solver</span>
            </h3>
            <p className="text-secondary text-sm" style={{ marginTop: 8, maxWidth: 280 }}>
              A community-driven platform connecting real-world problems
              with engineering minds to create lasting impact.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-link" aria-label="GitHub"><FiGithub /></a>
              <a href="#" className="social-link" aria-label="Twitter"><FiTwitter /></a>
              <a href="#" className="social-link" aria-label="Email"><FiMail /></a>
            </div>
          </div>

          {/* Links */}
          <div className="footer-links-group">
            <h4 className="footer-heading">Platform</h4>
            <Link to="/problems" className="footer-link">Browse Problems</Link>
            <Link to="/submit" className="footer-link">Submit Problem</Link>
            <Link to="/leaderboard" className="footer-link">Leaderboard</Link>
            <Link to="/about" className="footer-link">About Us</Link>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Engineering</h4>
            <Link to="/problems?category=civil" className="footer-link">Civil</Link>
            <Link to="/problems?category=mechanical" className="footer-link">Mechanical</Link>
            <Link to="/problems?category=software" className="footer-link">Software</Link>
            <Link to="/problems?category=electrical" className="footer-link">Electrical</Link>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Community</h4>
            <Link to="/auth" className="footer-link">Join Us</Link>
            <Link to="/about" className="footer-link">How It Works</Link>
            <a href="#" className="footer-link">Guidelines</a>
            <a href="#" className="footer-link">Contact</a>
          </div>
        </div>

        <div className="divider" style={{ margin: '32px 0 24px' }} />

        <div className="footer-bottom">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} ProblemSolver. All rights reserved.
          </p>
          <p className="text-sm text-muted flex gap-xs" style={{ alignItems: 'center' }}>
            Made with <FiHeart size={14} style={{ color: '#ef4444' }} /> for a better world
          </p>
        </div>
      </div>
    </footer>
  );
}
