import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiSend, FiUsers, FiCheckCircle, FiTrendingUp, FiZap } from 'react-icons/fi';
import { FaCogs, FaBolt, FaHardHat, FaLaptopCode, FaLeaf, FaDna, FaFlask, FaRocket } from 'react-icons/fa';
import StatsCounter from '../components/StatsCounter';
import ProblemCard from '../components/ProblemCard';
import { CATEGORIES } from '../data/sampleData';
import api from '../api/client';
import './LandingPage.css';

const ICON_MAP = {
  FaCogs, FaBolt, FaHardHat, FaLaptopCode, FaLeaf, FaDna, FaFlask, FaRocket,
};

export default function LandingPage() {
  const [featuredProblems, setFeaturedProblems] = useState([]);
  const [apiStats, setApiStats] = useState({ problemCount: 0, solutionCount: 0, userCount: 0, solvedCount: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, problemsRes] = await Promise.all([
          api.get('/stats'),
          api.get('/problems', { sort: 'most-voted', limit: 3 }),
        ]);
        setApiStats(statsRes.data);
        setFeaturedProblems(problemsRes.data);
      } catch (err) { console.error(err); }
    };
    load();
  }, []);

  const stats = [
    { icon: <FiSend />, value: apiStats.problemCount, label: 'Problems Posted', color: '#3b82f6' },
    { icon: <FiCheckCircle />, value: apiStats.solutionCount, label: 'Solutions Delivered', color: '#10b981' },
    { icon: <FiUsers />, value: apiStats.userCount, label: 'Community Members', color: '#8b5cf6' },
    { icon: <FiTrendingUp />, value: apiStats.solvedCount, label: 'Problems Solved', color: '#f97316' },
  ];

  const steps = [
    {
      num: '01',
      title: 'Submit a Problem',
      desc: 'Describe a real-world challenge that needs engineering expertise. Add category, urgency, and context.',
      icon: <FiSend size={28} />,
      color: '#3b82f6',
    },
    {
      num: '02',
      title: 'Community Collaborates',
      desc: 'Engineers, students, and experts discuss, brainstorm, and propose innovative solutions.',
      icon: <FiUsers size={28} />,
      color: '#8b5cf6',
    },
    {
      num: '03',
      title: 'Impact Delivered',
      desc: 'The best solutions get upvoted, refined, and implemented to create real-world impact.',
      icon: <FiZap size={28} />,
      color: '#f97316',
    },
  ];

  return (
    <div className="landing-page page-wrapper">
      {/* Particle Background */}
      <div className="particle-bg">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              background: i % 2 === 0 ? '#3b82f6' : '#f97316',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 4 + 6 + 's',
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="hero-section" id="hero">
        <div className="container">
          <div className="hero-content">
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FiZap size={14} />
              <span>Engineering Solutions for Real-World Problems</span>
            </motion.div>

            <motion.h1
              className="heading-xl hero-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Real Problems.{' '}
              <span className="text-gradient">Real Engineers.</span>
              <br />
              Real Impact.
            </motion.h1>

            <motion.p
              className="hero-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              A community-driven platform where society's toughest challenges
              meet brilliant engineering minds. Submit problems, collaborate on
              solutions, and build a better world — together.
            </motion.p>

            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link to="/problems" className="btn btn-primary btn-lg animate-pulse-glow" id="hero-browse-btn">
                Explore Problems <FiArrowRight />
              </Link>
              <Link to="/submit" className="btn btn-secondary btn-lg" id="hero-submit-btn">
                Submit a Challenge <FiSend size={16} />
              </Link>
            </motion.div>

            {/* Floating orbs */}
            <div className="hero-orb orb-1" />
            <div className="hero-orb orb-2" />
            <div className="hero-orb orb-3" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section" id="stats-section">
        <div className="container">
          <StatsCounter stats={stats} />
        </div>
      </section>

      {/* How It Works */}
      <section className="section how-it-works" id="how-it-works">
        <div className="container">
          <motion.div
            className="text-center mb-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-lg">
              How <span className="text-gradient">It Works</span>
            </h2>
            <p className="text-secondary mt-sm" style={{ maxWidth: 500, margin: '8px auto 0' }}>
              Three simple steps to turn real-world problems into engineered solutions.
            </p>
          </motion.div>

          <div className="steps-grid">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className="step-card glass-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <div className="step-num" style={{ color: step.color }}>{step.num}</div>
                <div className="step-icon" style={{ background: step.color + '15', color: step.color }}>
                  {step.icon}
                </div>
                <h3 className="heading-sm">{step.title}</h3>
                <p className="text-secondary text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Engineering Categories */}
      <section className="section" id="categories-section">
        <div className="container">
          <motion.div
            className="text-center mb-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-lg">
              Engineering <span className="text-gradient">Domains</span>
            </h2>
            <p className="text-secondary mt-sm" style={{ maxWidth: 500, margin: '8px auto 0' }}>
              Problems span every field of engineering — find your expertise.
            </p>
          </motion.div>

          <div className="grid-4">
            {CATEGORIES.map((cat, i) => {
              const Icon = ICON_MAP[cat.icon];
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/problems?category=${cat.id}`}
                    className="domain-card glass-card"
                    id={`domain-${cat.id}`}
                  >
                    <div className="domain-icon" style={{ background: cat.color + '15', color: cat.color }}>
                      {Icon && <Icon size={24} />}
                    </div>
                    <h4 className="font-semibold">{cat.name}</h4>
                    <p className="text-sm text-muted">{cat.description}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Problems */}
      <section className="section" id="featured-problems">
        <div className="container">
          <div className="flex-between mb-xl">
            <div>
              <h2 className="heading-lg">
                Trending <span className="text-gradient">Problems</span>
              </h2>
              <p className="text-secondary mt-sm">
                The most upvoted challenges waiting for your expertise.
              </p>
            </div>
            <Link to="/problems" className="btn btn-secondary hide-mobile">
              View All <FiArrowRight />
            </Link>
          </div>

          <div className="grid-3">
            {featuredProblems.map((problem, i) => (
              <ProblemCard key={problem._id || problem.id} problem={problem} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section" id="cta">
        <div className="container">
          <motion.div
            className="cta-card glass-panel"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-lg text-center">
              Ready to Make an <span className="text-gradient">Impact</span>?
            </h2>
            <p className="text-secondary text-center mt-md" style={{ maxWidth: 500, margin: '16px auto 0' }}>
              Join thousands of engineers, students, and changemakers building
              solutions that matter.
            </p>
            <div className="flex-center gap-md mt-xl">
              <Link to="/auth" className="btn btn-primary btn-lg">
                Join the Community <FiArrowRight />
              </Link>
              <Link to="/about" className="btn btn-ghost btn-lg">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
