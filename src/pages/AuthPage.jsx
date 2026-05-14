import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiArrowRight, FiEye, FiEyeOff, FiLoader } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';
import './AuthPage.css';

export default function AuthPage() {
  usePageTitle('Sign In');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('both');
  const [bio, setBio] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/problems', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.success) {
          toast.success('Welcome back!');
          navigate('/');
        } else {
          toast.error(result.error || 'Login failed');
        }
      } else {
        if (!name || !email || !password) {
          setSubmitting(false);
          return toast.error('All fields required');
        }
        const result = await register({ name, email, password, role, bio });
        if (result.success) {
          toast.success('Account created!');
          navigate('/');
        } else {
          toast.error(result.error || 'Registration failed');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    }
    setSubmitting(false);
  };

  if (user) return null;

  return (
    <div className="page-wrapper auth-page">
      <div className="auth-container">
        {/* Left: Branding */}
        <div className="auth-brand hide-mobile">
          <div className="auth-brand-content">
            <h2 className="heading-xl">
              Problem<span className="text-gradient">Solver</span>
            </h2>
            <p className="text-secondary mt-lg" style={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              Join a community of engineers, students, and innovators solving
              real-world problems that matter.
            </p>
            <div className="auth-features mt-2xl">
              {['Submit & discover problems', 'Propose engineering solutions', 'Earn reputation & badges', 'Make real-world impact'].map((f, i) => (
                <motion.div key={i} className="auth-feature" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                  <div className="auth-feature-dot" />
                  <span>{f}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
        </div>

        {/* Right: Form */}
        <motion.div className="auth-form-panel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="auth-toggle">
            <button className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)} id="login-tab">Sign In</button>
            <button className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)} id="register-tab">Sign Up</button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form key={isLogin ? 'login' : 'register'} onSubmit={handleSubmit} className="auth-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {!isLogin && (
                <div className="input-group">
                  <label>Full Name</label>
                  <div className="input-with-icon">
                    <FiUser className="input-icon" />
                    <input className="input" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} style={{ paddingLeft: 40 }} id="name-input" />
                  </div>
                </div>
              )}

              <div className="input-group">
                <label>Email</label>
                <div className="input-with-icon">
                  <FiMail className="input-icon" />
                  <input type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ paddingLeft: 40 }} id="email-input" />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: 40, paddingRight: 44 }}
                    id="password-input"
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} aria-label="Toggle password visibility">
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <>
                  <div className="input-group">
                    <label>I am a...</label>
                    <div className="role-options">
                      {[{ id: 'poster', label: 'Problem Poster' }, { id: 'engineer', label: 'Engineer' }, { id: 'student', label: 'Student' }, { id: 'both', label: 'Both' }].map((r) => (
                        <button key={r.id} type="button" className={`role-option ${role === r.id ? 'selected' : ''}`} onClick={() => setRole(r.id)}>{r.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Short Bio (optional)</label>
                    <textarea className="textarea" rows={2} placeholder="Tell us about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} id="bio-input" />
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={submitting} id="auth-submit-btn">
                {submitting ? (
                  <><FiLoader size={16} className="spin" /> {isLogin ? 'Signing In...' : 'Creating Account...'}</>
                ) : (
                  <>{isLogin ? 'Sign In' : 'Create Account'} <FiArrowRight /></>
                )}
              </button>

              {isLogin && (
                <p className="text-sm text-muted text-center mt-md">
                  Demo: <strong>ajmal@example.com</strong> / <strong>demo123</strong>
                </p>
              )}
            </motion.form>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
