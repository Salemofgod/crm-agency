const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const { protect } = require('../middleware/auth');
const { hasRole } = require('../middleware/roleMiddleware');
const {
  getUsers, getUser, updateUserCtrl, deleteUserCtrl,
  getTeams, createTeamCtrl, deleteTeamCtrl,
} = require('../controllers/userController');
const { sequelize } = require('../config/database');

router.use(protect);
router.use(hasRole('admin'));

router.get('/teams/all',    getTeams);
router.post('/teams',       createTeamCtrl);
router.delete('/teams/:id', deleteTeamCtrl);

router.get('/',         getUsers);
router.get('/:id',      getUser);
router.put('/:id',      updateUserCtrl);
router.delete('/:id',   deleteUserCtrl);

router.post('/create', async (req, res) => {
  try {
    const { name, email, password, role, team_id } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required.' });
    const validRoles = ['admin', 'manager', 'commercial', 'viewer'];
    if (!validRoles.includes(role))
      return res.status(400).json({ message: 'Invalid role. Use: ' + validRoles.join(', ') });
    const hashed = await bcrypt.hash(password, 10);
    await sequelize.query(`
      INSERT INTO users (name, email, password, role, team_id)
      VALUES (:name, :email, :hashed, :role, :team_id)
    `, { replacements: { name, email, hashed, role: role || 'commercial', team_id: team_id || null } });
    res.status(201).json({ message: 'User created successfully.' });
  } catch (err) {
    if (err.message.includes('unique')) return res.status(400).json({ message: 'Email already exists.' });
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
