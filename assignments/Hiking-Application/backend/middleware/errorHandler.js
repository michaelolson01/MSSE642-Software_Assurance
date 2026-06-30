const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.message.includes('Duplicate entry')) {
    return res.status(409).json({ error: 'Resource already exists' });
  }

  if (err.message.includes('ER_NO_REFERENCED_ROW')) {
    return res.status(400).json({ error: 'Invalid reference' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};

module.exports = { errorHandler };
