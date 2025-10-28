const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SliderItem = sequelize.define('SliderItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sliderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    orderIndex: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    customTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    customDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    customImageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'slider_items',
    timestamps: true
  });

  return SliderItem;
};