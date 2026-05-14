import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon, FiMenu, FiX, FiSearch, FiBell, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/problems', label: 'Problems' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/about', label: 'About' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar" id="main-navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" id="logo-link">
          <div className="logo-icon">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="url(#navGrad)" opacity="0.15"/>
              <path d="M16 8a6 6 0 0 0-2 11.6V22a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2.4A6 6 0 0 0 16 8z" fill="url(#navGrad)"/>
              <rect x="13" y="24" width="6" height="2" rx="1" fill="url(#navGrad)" opacity="0.7"/>
              <defs>
                <linearGradient id="navGrad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#3b82f6"/>
                  <stop offset="1" stopColor="#f97316"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="logo-text">
            Problem<span className="logo-accent">Solver</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-links hide-mobile">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
              id={`nav-${link.label.toLowerCase()}`}
            >
              {link.label}
              {isActive(link.path) && (
                <motion.div
                  className="nav-indicator"
                  layoutId="nav-indicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          <button
            className="btn-icon nav-action-btn"
            onClick={toggleTheme}
            id="theme-toggle"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
              </motion.div>
            </AnimatePresence>
          </button>

          {user ? (
            <>
              <Link
                to="/submit"
                className="btn btn-primary btn-sm hide-mobile"
                id="submit-problem-btn"
              >
                <FiPlus size={16} /> Submit Problem
              </Link>

              <div className="profile-menu-wrapper">
                <button
                  className="avatar avatar-sm nav-avatar"
                  onClick={() => setProfileOpen(!profileOpen)}
                  id="profile-avatar"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      className="profile-dropdown glass-panel"
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="profile-dropdown-header">
                        <span className="font-semibold">{user.name}</span>
                        <span className="text-sm text-muted">{user.email}</span>
                      </div>
                      <div className="divider" />
                      <Link
                        to="/profile"
                        className="dropdown-item"
                        onClick={() => setProfileOpen(false)}
                        id="dropdown-profile"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/submit"
                        className="dropdown-item"
                        onClick={() => setProfileOpen(false)}
                        id="dropdown-submit"
                      >
                        Submit Problem
                      </Link>
                      {user.is_admin && (
                        <Link
                          to="/admin"
                          className="dropdown-item"
                          onClick={() => setProfileOpen(false)}
                          id="dropdown-admin"
                          style={{ color: '#a78bfa' }}
                        >
                          ⚙️ Admin Dashboard
                        </Link>
                      )}
                      <div className="divider" />
                      <button
                        className="dropdown-item text-danger"
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                          navigate('/');
                        }}
                        id="dropdown-logout"
                      >
                        Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link to="/auth" className="btn btn-primary btn-sm" id="login-btn">
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="btn-icon nav-action-btn mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            id="mobile-menu-toggle"
          >
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-nav glass-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <>
                <Link
                  to="/submit"
                  className="btn btn-primary mobile-submit-btn"
                  onClick={() => setMobileOpen(false)}
                >
                  <FiPlus size={16} /> Submit Problem
                </Link>
                {user.is_admin && (
                  <Link
                    to="/admin"
                    className="mobile-nav-link"
                    onClick={() => setMobileOpen(false)}
                    style={{ color: '#a78bfa' }}
                  >
                    ⚙️ Admin Dashboard
                  </Link>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
