import { useState, useCallback } from 'react';
import api from '../api/client';

export function useProblems() {
  const [problems, setProblems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    urgency: '',
    search: '',
    sort: 'newest',
  });

  const fetchProblems = useCallback(async (filterOverrides = {}) => {
    setLoading(true);
    try {
      const params = { ...filters, ...filterOverrides };
      const { data, pagination: pag } = await api.get('/problems', params);
      setProblems(data);
      if (pag) setPagination(pag);
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    }
    setLoading(false);
  }, [filters]);

  const addProblem = useCallback(async (problemData) => {
    const { data } = await api.post('/problems', problemData);
    return data;
  }, []);

  const voteProblem = useCallback(async (problemId) => {
    const { data } = await api.post(`/problems/${problemId}/vote`);
    // Update local state
    setProblems((prev) =>
      prev.map((p) => {
        if ((p._id || p.id) !== problemId) return p;
        return { ...p, votes: data.votes };
      })
    );
    return data;
  }, []);

  const getProblemById = useCallback(async (id) => {
    const { data } = await api.get(`/problems/${id}`);
    return data;
  }, []);

  // For backward compatibility, provide getFilteredProblems that returns current state
  const getFilteredProblems = useCallback(() => problems, [problems]);

  return {
    problems,
    pagination,
    loading,
    filters,
    setFilters,
    fetchProblems,
    addProblem,
    voteProblem,
    getProblemById,
    getFilteredProblems,
  };
}
