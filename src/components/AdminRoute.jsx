import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useEffect, useRef } from 'react';

/**
 * Route guard that only allows admin users to access wrapped routes.
 * Redirects non-admin users to the home page with an access denied toast.
 */
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const toastShown = useRef(false);

  useEffect(() => {
    if (!loading && (!user || !user.is_admin) && !toastShown.current) {
      toast.error('Access denied. Admin privileges required.');
      toastShown.current = true;
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="auth-spinner" />
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
