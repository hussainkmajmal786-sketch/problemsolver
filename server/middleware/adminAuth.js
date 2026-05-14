import supabase from '../config/supabase.js';

/**
 * Admin authorization middleware.
 * Must be used AFTER the regular auth middleware (which sets req.user).
 * Checks if the authenticated user has admin privileges.
 */
const adminAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!req.user.is_admin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default adminAuth;
