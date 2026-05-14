const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Supabase/PostgreSQL error
  if (err.code && typeof err.code === 'string' && err.code.length === 5) {
    statusCode = 400;
    if (err.code === '23505') message = 'A record with this data already exists.';
    else if (err.code === '23503') message = 'Referenced record not found.';
    else if (err.code === '23514') message = 'Data validation failed.';
    else message = err.message || 'Database error';
  }

  // UUID format error
  if (err.message?.includes('invalid input syntax for type uuid')) {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Log in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

export default errorHandler;
