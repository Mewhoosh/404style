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
      allowNull: false,
      references: {
        model: 'Sliders',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true, // NULL for custom cards
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    order: {
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
    tableName: 'slideritems',
    timestamps: true
  });

  SliderItem.associate = (models) => {
    SliderItem.belongsTo(models.Slider, { as: 'slider', foreignKey: 'sliderId' });
    SliderItem.belongsTo(models.Product, { as: 'product', foreignKey: 'productId' });
  };

  return SliderItem;
};