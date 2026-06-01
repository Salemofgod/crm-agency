const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Client = sequelize.define('Client', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:       { type: DataTypes.STRING(150), allowNull: false },
  email:      { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
  phone:      { type: DataTypes.STRING(30) },
  company:    { type: DataTypes.STRING(150) },
  address:    { type: DataTypes.TEXT },
  status:     { type: DataTypes.ENUM('active', 'inactive', 'prospect'), defaultValue: 'active' },
  notes:      { type: DataTypes.TEXT },
  created_by: { type: DataTypes.INTEGER },
}, {
  tableName: 'clients',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Client;
