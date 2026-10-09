const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Not signed in' });
  try {
    req.parentId = jwt.verify(token, process.env.JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ message: 'Session expired, please sign in again' });
  }
};

// wraps async handlers so errors become JSON responses
exports.h = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    const status = e.status || (e.name === 'CastError' || e.name === 'ValidationError' ? 400 : 500);
    res.status(status).json({ message: e.message });
  });
