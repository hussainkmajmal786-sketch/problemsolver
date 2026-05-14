import { motion } from 'framer-motion';
import { FaCogs, FaBolt, FaHardHat, FaLaptopCode, FaLeaf, FaDna, FaFlask, FaRocket } from 'react-icons/fa';
import { CATEGORIES } from '../data/sampleData';
import './CategoryFilter.css';

const ICON_MAP = {
  FaCogs, FaBolt, FaHardHat, FaLaptopCode, FaLeaf, FaDna, FaFlask, FaRocket,
};

export default function CategoryFilter({ selected, onChange }) {
  return (
    <div className="category-filter" id="category-filter">
      <button
        className={`cat-chip ${!selected ? 'active' : ''}`}
        onClick={() => onChange('')}
      >
        All
      </button>
      {CATEGORIES.map((cat) => {
        const Icon = ICON_MAP[cat.icon];
        const isActive = selected === cat.id;
        return (
          <motion.button
            key={cat.id}
            className={`cat-chip ${isActive ? 'active' : ''}`}
            onClick={() => onChange(isActive ? '' : cat.id)}
            whileTap={{ scale: 0.95 }}
            style={isActive ? {
              borderColor: cat.color + '60',
              background: cat.color + '15',
              color: cat.color,
            } : {}}
          >
            {Icon && <Icon size={14} />}
            {cat.name}
          </motion.button>
        );
      })}
    </div>
  );
}
