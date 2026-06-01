const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sale = sequelize.define('Sale', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title:       { type: DataTypes.STRING(200), allowNull: false },
  client_id:   { type: DataTypes.INTEGER, allowNull: false },
  amount:      { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  status:      { type: DataTypes.ENUM('pending', 'won', 'lost', 'in_progress'), defaultValue: 'pending' },
  description: { type: DataTypes.TEXT },
  deal_date:   { type: DataTypes.DATEONLY },
  created_by:  { type: DataTypes.INTEGER },
}, {
  tableName: 'sales',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Sale;
