const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Theme = sequelize.define('Theme', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  colorPrimary: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '#0a0e27'
  },
  colorSecondary: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '#ff6b35'
  },
  colorAccent: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '#f7f7f7'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'themes'
});

module.exports = Theme;