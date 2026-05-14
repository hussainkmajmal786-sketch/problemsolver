import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiGrid, FiList } from 'react-icons/fi';
import CategoryFilter from '../components/CategoryFilter';
import ProblemCard from '../components/ProblemCard';
import Pagination from '../components/Pagination';
import { SkeletonGrid } from '../components/Skeleton';
import { useProblems } from '../hooks/useProblems';
import usePageTitle from '../hooks/usePageTitle';
import './ProblemsPage.css';

export default function ProblemsPage() {
  usePageTitle('Browse Problems');
  const [searchParams] = useSearchParams();
  const { problems, loading, filters, setFilters, fetchProblems, pagination } = useProblems();
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Pick up category from URL
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setFilters((prev) => ({ ...prev, category: cat }));
  }, [searchParams]);

  // Fetch when filters or page change
  useEffect(() => {
    fetchProblems({ page });
  }, [filters, page, fetchProblems]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-wrapper problems-page">
      <div className="container">
        <motion.div className="pp-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="heading-lg">Browse <span className="text-gradient">Problems</span></h1>
            <p className="text-secondary mt-sm">
              {loading ? 'Loading...' : `${pagination.total || 0} problems waiting for engineering solutions`}
            </p>
          </div>
        </motion.div>

        <div className="pp-toolbar glass-card" id="toolbar">
          <div className="pp-search">
            <FiSearch size={18} className="text-muted" />
            <input
              className="pp-search-input"
              placeholder="Search problems, tags, or keywords..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              id="search-input"
            />
          </div>
          <div className="pp-toolbar-actions">
            <select className="select pp-select" value={filters.sort} onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))} id="sort-select">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="most-voted">Most Voted</option>
              <option value="most-viewed">Most Viewed</option>
            </select>
            <select className="select pp-select" value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))} id="status-filter">
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="solved">Solved</option>
            </select>
            <select className="select pp-select" value={filters.urgency} onChange={(e) => setFilters((prev) => ({ ...prev, urgency: e.target.value }))} id="urgency-filter">
              <option value="">All Urgency</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <div className="pp-view-toggle hide-mobile">
              <button className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} id="grid-view-btn"><FiGrid size={16} /></button>
              <button className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} id="list-view-btn"><FiList size={16} /></button>
            </div>
          </div>
        </div>

        <CategoryFilter selected={filters.category} onChange={(cat) => { setFilters((prev) => ({ ...prev, category: cat })); setPage(1); }} />

        {loading ? (
          <SkeletonGrid count={6} />
        ) : problems.length === 0 ? (
          <div className="pp-empty">
            <FiSearch size={48} />
            <h3 className="heading-md mt-md">No problems found</h3>
            <p className="text-secondary mt-sm">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            <div className={`pp-grid ${viewMode === 'list' ? 'list-view' : ''}`} id="problems-grid">
              {problems.map((problem, i) => (
                <ProblemCard key={problem._id || problem.id} problem={problem} index={i} />
              ))}
            </div>
            <Pagination
              page={page}
              pages={pagination.pages}
              total={pagination.total}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
