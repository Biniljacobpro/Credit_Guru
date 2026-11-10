const notFound = (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  if (error.code === '23505') {
    return res.status(409).json({ error: 'A record with the same unique value already exists.' });
  }

  if (error.code === '23503') {
    return res.status(400).json({ error: 'The referenced record does not exist.' });
  }

  res.status(error.statusCode || 500).json({
    error: error.statusCode ? error.message : 'Internal server error',
  });
};

module.exports = { notFound, errorHandler };
