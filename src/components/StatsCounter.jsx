import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import './StatsCounter.css';

function Counter({ end, duration = 2000, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export default function StatsCounter({ stats }) {
  return (
    <div className="stats-counter" id="stats-counter">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          className="stat-item glass-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
        >
          <div className="stat-icon" style={{ color: stat.color }}>
            {stat.icon}
          </div>
          <div className="stat-value">
            <Counter end={stat.value} suffix={stat.suffix || ''} prefix={stat.prefix || ''} />
          </div>
          <div className="stat-label">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
