const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      data: null,
      errors: Object.values(err.errors).map(error => error.message)
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      data: null,
      errors: ['Duplicate field value entered']
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      data: null,
      errors: ['Invalid token']
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    data: null,
    errors: [err.message || 'Internal server error']
  });
};

module.exports = errorHandler;