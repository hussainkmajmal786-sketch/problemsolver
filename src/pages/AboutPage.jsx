import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiTarget, FiUsers, FiAward, FiGlobe, FiHeart, FiShield } from 'react-icons/fi';
import usePageTitle from '../hooks/usePageTitle';
import './AboutPage.css';

export default function AboutPage() {
  usePageTitle('About');
  const values = [
    { icon: <FiTarget size={28} />, title: 'Impact-Driven', desc: 'Every problem on our platform represents a real challenge faced by real people.' },
    { icon: <FiUsers size={28} />, title: 'Community First', desc: 'We believe the best solutions come from diverse minds working together.' },
    { icon: <FiGlobe size={28} />, title: 'Global Reach', desc: 'Problems and solutions transcend borders. Engineering is universal.' },
    { icon: <FiHeart size={28} />, title: 'Open & Inclusive', desc: 'Everyone — students, professionals, hobbyists — has something valuable to contribute.' },
    { icon: <FiShield size={28} />, title: 'Quality & Trust', desc: 'Peer review, voting, and reputation ensure the best solutions rise to the top.' },
    { icon: <FiAward size={28} />, title: 'Recognition', desc: 'Contributors earn reputation, badges, and community recognition for their work.' },
  ];

  return (
    <div className="page-wrapper about-page">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Hero */}
          <div className="about-hero text-center">
            <h1 className="heading-xl">
              About <span className="text-gradient">ProblemSolver</span>
            </h1>
            <p className="text-secondary mt-lg" style={{ maxWidth: 600, margin: '16px auto 0', fontSize: '1.1rem', lineHeight: 1.7 }}>
              We're building a bridge between society's toughest challenges and the brilliant
              engineering minds that can solve them. Our platform empowers communities to voice
              their problems and enables engineers worldwide to collaborate on solutions.
            </p>
          </div>

          {/* Mission */}
          <div className="about-mission glass-panel mt-2xl">
            <h2 className="heading-md text-center">Our Mission</h2>
            <p className="text-secondary text-center mt-md" style={{ maxWidth: 550, margin: '16px auto 0' }}>
              To democratize problem-solving by connecting those who face challenges with those
              who have the skills to solve them — creating a world where no engineering problem
              goes unanswered.
            </p>
          </div>

          {/* Values */}
          <div className="mt-2xl">
            <h2 className="heading-lg text-center mb-xl">Our <span className="text-gradient">Values</span></h2>
            <div className="grid-3">
              {values.map((v, i) => (
                <motion.div
                  key={i}
                  className="value-card glass-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="value-icon">{v.icon}</div>
                  <h3 className="heading-sm">{v.title}</h3>
                  <p className="text-sm text-secondary">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="about-cta text-center mt-2xl">
            <h2 className="heading-lg">Ready to <span className="text-gradient">Contribute</span>?</h2>
            <div className="flex-center gap-md mt-xl">
              <Link to="/auth" className="btn btn-primary btn-lg">Join the Community</Link>
              <Link to="/problems" className="btn btn-secondary btn-lg">Browse Problems</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
