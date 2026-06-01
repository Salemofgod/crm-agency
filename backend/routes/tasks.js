const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getAllTasks, getTaskById, createTask, updateTask, deleteTask } = require('../controllers/taskController');

router.use(protect);
router.get('/',       getAllTasks);
router.get('/:id',    getTaskById);
router.post('/',      createTask);
router.put('/:id',    updateTask);
router.delete('/:id', adminOnly, deleteTask);

module.exports = router;
