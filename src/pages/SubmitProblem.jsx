import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSend, FiImage, FiMapPin, FiAlertTriangle } from 'react-icons/fi';
import { FaCogs, FaBolt, FaHardHat, FaLaptopCode, FaLeaf, FaDna, FaFlask, FaRocket } from 'react-icons/fa';
import { useProblems } from '../hooks/useProblems';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, URGENCY_LEVELS } from '../data/sampleData';
import toast from 'react-hot-toast';
import './SubmitProblem.css';

const ICON_MAP = {
  FaCogs, FaBolt, FaHardHat, FaLaptopCode, FaLeaf, FaDna, FaFlask, FaRocket,
};

export default function SubmitProblem() {
  const { user } = useAuth();
  const { addProblem } = useProblems();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    urgency: 'medium',
    location: '',
    tags: '',
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in first');
      return navigate('/auth');
    }
    if (!form.title || !form.description || !form.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const problem = await addProblem({
        ...form,
        tags: form.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
      });
      toast.success('Problem submitted successfully!');
      navigate(`/problems/${problem._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to submit problem');
    }
  };

  if (!user) {
    return (
      <div className="page-wrapper flex-center" style={{ minHeight: '60vh' }}>
        <div className="text-center glass-card" style={{ padding: '48px' }}>
          <FiAlertTriangle size={48} style={{ color: 'var(--color-warning)', marginBottom: 16 }} />
          <h2 className="heading-md mb-md">Sign In Required</h2>
          <p className="text-secondary mb-lg">You need to be signed in to submit a problem.</p>
          <a href="/auth" className="btn btn-primary">Sign In</a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper submit-page">
      <div className="container">
        <motion.div
          className="submit-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="submit-header">
            <h1 className="heading-lg">
              Submit a <span className="text-gradient">Problem</span>
            </h1>
            <p className="text-secondary mt-sm">
              Describe the challenge you've identified. The community will collaborate on solutions.
            </p>
          </div>

          {/* Progress */}
          <div className="submit-progress">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`progress-step ${step >= s ? 'active' : ''} ${step === s ? 'current' : ''}`}>
                <div className="progress-dot">{s}</div>
                <span className="text-xs">{['Details', 'Context', 'Review'][s - 1]}</span>
              </div>
            ))}
            <div className="progress-line">
              <div className="progress-fill" style={{ width: `${((step - 1) / 2) * 100}%` }} />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Details */}
            {step === 1 && (
              <motion.div
                className="submit-step glass-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                id="step-1"
              >
                <div className="input-group mb-lg">
                  <label>Problem Title *</label>
                  <input
                    className="input"
                    placeholder="e.g., Clean water purification for remote villages"
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                    required
                    id="problem-title"
                  />
                </div>

                <div className="input-group mb-lg">
                  <label>Detailed Description *</label>
                  <textarea
                    className="textarea"
                    placeholder="Describe the problem in detail. Include context, affected population, constraints, desired outcomes..."
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    rows={8}
                    required
                    id="problem-description"
                  />
                </div>

                <div className="input-group mb-lg">
                  <label>Engineering Category *</label>
                  <div className="category-select-grid">
                    {CATEGORIES.map((cat) => {
                      const Icon = ICON_MAP[cat.icon];
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          className={`category-option ${form.category === cat.id ? 'selected' : ''}`}
                          onClick={() => update('category', cat.id)}
                          style={form.category === cat.id ? { borderColor: cat.color, background: cat.color + '10' } : {}}
                        >
                          <div style={{ color: cat.color }}>{Icon && <Icon size={20} />}</div>
                          <span>{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    if (!form.title || !form.description || !form.category) {
                      return toast.error('Please fill all required fields');
                    }
                    setStep(2);
                  }}
                  id="next-step-1"
                >
                  Next: Context →
                </button>
              </motion.div>
            )}

            {/* Step 2: Context */}
            {step === 2 && (
              <motion.div
                className="submit-step glass-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                id="step-2"
              >
                <div className="input-group mb-lg">
                  <label>Urgency Level</label>
                  <div className="urgency-options">
                    {URGENCY_LEVELS.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        className={`urgency-option ${form.urgency === u.id ? 'selected' : ''}`}
                        onClick={() => update('urgency', u.id)}
                        style={form.urgency === u.id ? { borderColor: u.color, color: u.color, background: u.color + '15' } : {}}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="input-group mb-lg">
                  <label>Location</label>
                  <div className="input-with-icon">
                    <FiMapPin className="input-icon" />
                    <input
                      className="input"
                      placeholder="e.g., Mumbai, India or Global"
                      value={form.location}
                      onChange={(e) => update('location', e.target.value)}
                      style={{ paddingLeft: 40 }}
                      id="problem-location"
                    />
                  </div>
                </div>

                <div className="input-group mb-lg">
                  <label>Tags (comma separated)</label>
                  <input
                    className="input"
                    placeholder="e.g., water, sustainability, low-cost, rural"
                    value={form.tags}
                    onChange={(e) => update('tags', e.target.value)}
                    id="problem-tags"
                  />
                </div>

                <div className="flex gap-sm">
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => setStep(3)} id="next-step-2">
                    Next: Review →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div
                className="submit-step glass-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                id="step-3"
              >
                <h3 className="heading-sm mb-lg">Review Your Problem</h3>

                <div className="review-field">
                  <span className="text-muted text-xs">TITLE</span>
                  <p className="font-semibold">{form.title}</p>
                </div>

                <div className="review-field">
                  <span className="text-muted text-xs">DESCRIPTION</span>
                  <p className="text-secondary text-sm" style={{ whiteSpace: 'pre-line' }}>
                    {form.description}
                  </p>
                </div>

                <div className="review-row">
                  <div className="review-field">
                    <span className="text-muted text-xs">CATEGORY</span>
                    <p>{CATEGORIES.find((c) => c.id === form.category)?.name}</p>
                  </div>
                  <div className="review-field">
                    <span className="text-muted text-xs">URGENCY</span>
                    <p>{URGENCY_LEVELS.find((u) => u.id === form.urgency)?.label}</p>
                  </div>
                  <div className="review-field">
                    <span className="text-muted text-xs">LOCATION</span>
                    <p>{form.location || 'Not specified'}</p>
                  </div>
                </div>

                {form.tags && (
                  <div className="review-field">
                    <span className="text-muted text-xs">TAGS</span>
                    <div className="flex gap-xs flex-wrap mt-sm">
                      {form.tags.split(',').map((t, i) => (
                        <span key={i} className="pc-tag">#{t.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-sm mt-xl">
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>
                    ← Back
                  </button>
                  <button type="submit" className="btn btn-accent btn-lg" id="final-submit-btn">
                    <FiSend size={16} /> Submit Problem
                  </button>
                </div>
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}
