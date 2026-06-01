const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/database');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized. No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await sequelize.query(
      'SELECT id, name, email, role, team_id FROM users WHERE id = :id LIMIT 1',
      { replacements: { id: decoded.id }, type: sequelize.QueryTypes.SELECT }
    );

    if (!result || result.length === 0) {
      return res.status(401).json({ message: 'User not found.' });
    }

    req.user = result[0];
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalid or expired.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = { protect, adminOnly };
