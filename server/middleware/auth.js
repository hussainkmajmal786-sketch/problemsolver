import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided. Please sign in.' });
    }

    const token = header.split(' ')[1];

    // Verify Supabase JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', decoded.sub)
      .single();

    if (error || !profile) {
      return res.status(401).json({ success: false, message: 'User not found. Token invalid.' });
    }

    req.user = profile;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please sign in again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    next(error);
  }
};

export default auth;
