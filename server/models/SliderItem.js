const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SliderItem = sequelize.define('SliderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sliderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sliders',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  orderIndex: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  customDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'slider_items'
});

module.exports = SliderItem;