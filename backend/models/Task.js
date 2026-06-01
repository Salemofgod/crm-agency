const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Task = sequelize.define('Task', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title:       { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  status:      { type: DataTypes.ENUM('todo', 'in_progress', 'done'), defaultValue: 'todo' },
  priority:    { type: DataTypes.ENUM('low', 'medium', 'high'), defaultValue: 'medium' },
  due_date:    { type: DataTypes.DATEONLY },
  client_id:   { type: DataTypes.INTEGER },
  sale_id:     { type: DataTypes.INTEGER },
  assigned_to: { type: DataTypes.INTEGER },
  created_by:  { type: DataTypes.INTEGER },
}, {
  tableName: 'tasks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Task;
