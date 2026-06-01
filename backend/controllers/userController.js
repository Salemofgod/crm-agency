const { getAllUsers, getUserById, updateUser, deleteUser, getAllTeams, createTeam, deleteTeam } = require('../models/userModel');

const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUserCtrl = async (req, res) => {
  try {
    const { name, email, role, team_id } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Name, email and role are required.' });
    }
    const updated = await updateUser(req.params.id, { name, email, role, team_id });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUserCtrl = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }
    await deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTeams = async (req, res) => {
  try {
    const teams = await getAllTeams();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createTeamCtrl = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Team name is required.' });
    const team = await createTeam(name);
    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteTeamCtrl = async (req, res) => {
  try {
    await deleteTeam(req.params.id);
    res.json({ message: 'Team deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getUsers, getUser, updateUserCtrl, deleteUserCtrl, getTeams, createTeamCtrl, deleteTeamCtrl };
