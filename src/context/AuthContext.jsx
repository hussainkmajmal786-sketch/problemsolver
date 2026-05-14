import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('ps_token');
      if (!token) { setLoading(false); return; }
      try {
        const { user: userData } = await api.get('/auth/me');
        setUser(userData);
      } catch {
        localStorage.removeItem('ps_token');
        localStorage.removeItem('ps_user');
      }
      setLoading(false);
    };
    loadUser();

    // Listen for forced logouts from API client
    const handleLogout = () => { setUser(null); };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = async (email, password) => {
    try {
      const { token, user: userData } = await api.post('/auth/login', { email, password });
      localStorage.setItem('ps_token', token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const { token, user: newUser } = await api.post('/auth/register', userData);
      localStorage.setItem('ps_token', token);
      setUser(newUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('ps_token');
    localStorage.removeItem('ps_user');
    setUser(null);
  };

  const updateProfile = async (updates) => {
    try {
      const { user: updated } = await api.put('/auth/profile', updates);
      setUser(updated);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
