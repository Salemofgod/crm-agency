const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/database');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const users = await sequelize.query(
      'SELECT id, name, email, role, password, team_id FROM users WHERE email = :email LIMIT 1',
      { replacements: { email }, type: sequelize.QueryTypes.SELECT }
    );

    const user = users[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({
      token: generateToken(user.id),
      user: {
        id:      user.id,
        name:    user.name,
        email:   user.email,
        role:    user.role,
        team_id: user.team_id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

const getMe = async (req, res) => {
  res.json({
    id:      req.user.id,
    name:    req.user.name,
    email:   req.user.email,
    role:    req.user.role,
    team_id: req.user.team_id,
  });
};

module.exports = { login, getMe };