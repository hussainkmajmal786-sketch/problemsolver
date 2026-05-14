import { useState, useCallback } from 'react';
import api from '../api/client';

export function useSolutions() {
  const [solutions, setSolutions] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSolutions = useCallback(async (problemId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/solutions/problem/${problemId}`);
      setSolutions(data);
    } catch (error) {
      console.error('Failed to fetch solutions:', error);
    }
    setLoading(false);
  }, []);

  const fetchComments = useCallback(async (problemId) => {
    try {
      const { data } = await api.get(`/comments/problem/${problemId}`);
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  }, []);

  const addSolution = useCallback(async (problemId, solutionData) => {
    const { data } = await api.post(`/solutions/problem/${problemId}`, solutionData);
    setSolutions((prev) => [data, ...prev]);
    return data;
  }, []);

  const voteSolution = useCallback(async (solutionId) => {
    const { data } = await api.post(`/solutions/${solutionId}/vote`);
    setSolutions((prev) =>
      prev.map((s) => {
        if ((s._id || s.id) !== solutionId) return s;
        return { ...s, votes: data.votes };
      })
    );
    return data;
  }, []);

  const acceptSolution = useCallback(async (solutionId) => {
    const { data } = await api.put(`/solutions/${solutionId}/accept`);
    setSolutions((prev) =>
      prev.map((s) => {
        if ((s._id || s.id) !== solutionId) return s;
        return { ...s, isAccepted: data.isAccepted };
      })
    );
    return data;
  }, []);

  const addComment = useCallback(async (problemId, commentData) => {
    const { data } = await api.post(`/comments/problem/${problemId}`, commentData);
    setComments((prev) => [...prev, data]);
    return data;
  }, []);

  // Backward-compatible getters
  const getSolutionsByProblem = useCallback(() => solutions, [solutions]);
  const getCommentsByProblem = useCallback(() => comments, [comments]);

  return {
    solutions,
    comments,
    loading,
    fetchSolutions,
    fetchComments,
    addSolution,
    voteSolution,
    acceptSolution,
    addComment,
    getSolutionsByProblem,
    getCommentsByProblem,
  };
}
