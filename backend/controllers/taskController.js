const { Task, Client, Sale, User } = require('../models');

const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        { model: Client, as: 'client',   attributes: ['id', 'name'] },
        { model: Sale,   as: 'sale',     attributes: ['id', 'title'] },
        { model: User,   as: 'assignee', attributes: ['id', 'name'] },
        { model: User,   as: 'creator',  attributes: ['id', 'name'] },
      ],
      order: [['due_date', 'ASC']],
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks.', error: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client',   attributes: ['id', 'name'] },
        { model: Sale,   as: 'sale',     attributes: ['id', 'title'] },
        { model: User,   as: 'assignee', attributes: ['id', 'name'] },
        { model: User,   as: 'creator',  attributes: ['id', 'name'] },
      ],
    });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch task.', error: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, due_date, client_id, sale_id, assigned_to } = req.body;
    if (!title) return res.status(400).json({ message: 'Task title is required.' });
    const task = await Task.create({ title, description, status: status || 'todo', priority: priority || 'medium', due_date, client_id, sale_id, assigned_to, created_by: req.user.id });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task.', error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    const { title, description, status, priority, due_date, client_id, sale_id, assigned_to } = req.body;
    await task.update({ title, description, status, priority, due_date, client_id, sale_id, assigned_to });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task.', error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    await task.destroy();
    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task.', error: error.message });
  }
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };
